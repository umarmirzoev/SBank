using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Enums;
using SomoniBank.Domain.Filtres;
using SomoniBank.Domain.Models;
using SomoniBank.Infrastructure.Data;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.Infrastructure.Services;

public class AccountService(AppDbContext db, INotificationService notificationService, ILogger<AccountService> logger) : IAccountService
{
    public async Task<Response<AccountGetDto>> GetByIdAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Account> query = db.Accounts.AsNoTracking();
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.UserId == requesterUserId.Value);

            var account = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (account == null)
                return new Response<AccountGetDto>(HttpStatusCode.NotFound, "Account not found");

            return new Response<AccountGetDto>(HttpStatusCode.OK, "Success", MapToDto(account));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAccountById failed");
            return new Response<AccountGetDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<PagedResult<AccountGetDto>> GetAllAsync(AccountFilter filter, PagedQuery pagedQuery)
    {
        var page = pagedQuery.Page <= 0 ? 1 : pagedQuery.Page;
        var pageSize = pagedQuery.PageSize <= 0 ? 10 : pagedQuery.PageSize;

        IQueryable<Account> query = db.Accounts.AsNoTracking();

        if (filter?.UserId != null)
            query = query.Where(x => x.UserId == filter.UserId);

        if (!string.IsNullOrWhiteSpace(filter?.Type))
        {
            if (!Enum.TryParse<AccountType>(filter.Type, true, out var accountType))
                return EmptyPagedResult<AccountGetDto>(page, pageSize);
            query = query.Where(x => x.Type == accountType);
        }

        if (!string.IsNullOrWhiteSpace(filter?.Status))
        {
            if (!Enum.TryParse<AccountStatus>(filter.Status, true, out var accountStatus))
                return EmptyPagedResult<AccountGetDto>(page, pageSize);
            query = query.Where(x => x.Status == accountStatus);
        }

        if (!string.IsNullOrWhiteSpace(filter?.Currency))
        {
            if (!Enum.TryParse<Currency>(filter.Currency, true, out var currency))
                return EmptyPagedResult<AccountGetDto>(page, pageSize);
            query = query.Where(x => x.Currency == currency);
        }

        if (filter?.IsActive != null)
            query = query.Where(x => x.IsActive == filter.IsActive);

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<AccountGetDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<Response<AccountGetDto>> CreateAsync(Guid userId, AccountInsertDto dto, string ipAddress, string userAgent)
    {
        try
        {
            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return new Response<AccountGetDto>(HttpStatusCode.NotFound, "User not found");

            if (dto == null || string.IsNullOrWhiteSpace(dto.Type) || string.IsNullOrWhiteSpace(dto.Currency))
                return new Response<AccountGetDto>(HttpStatusCode.BadRequest, "Account type and currency are required");

            if (!Enum.TryParse<AccountType>(dto.Type, true, out var accountType))
                return new Response<AccountGetDto>(HttpStatusCode.BadRequest, "Invalid account type");

            if (!Enum.TryParse<Currency>(dto.Currency, true, out var currency))
                return new Response<AccountGetDto>(HttpStatusCode.BadRequest, "Invalid account currency");

            var account = new Account
            {
                UserId = userId,
                AccountNumber = await GenerateAccountNumberAsync(),
                Type = accountType,
                Status = AccountStatus.Active,
                Currency = currency,
                Balance = 0m,
                IsActive = true
            };

            db.Accounts.Add(account);
            db.TransactionLimits.Add(new TransactionLimit
            {
                AccountId = account.Id
            });
            db.AuditLogs.Add(CreateAuditLog(userId, "AccountOpened", ipAddress, userAgent, true));
            await db.SaveChangesAsync();
            await notificationService.SendAsync(userId, "Account opened", $"New {account.Type} account {account.AccountNumber} was created successfully.", "Account");

            return new Response<AccountGetDto>(HttpStatusCode.OK, "Account opened successfully", MapToDto(account));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "CreateAccount failed");
            return new Response<AccountGetDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> BlockAsync(Guid id, string ipAddress, string userAgent, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Account> query = db.Accounts;
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.UserId == requesterUserId.Value);

            var account = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (account == null)
                return new Response<string>(HttpStatusCode.NotFound, "Account not found");

            if (account.Status == AccountStatus.Closed)
                return new Response<string>(HttpStatusCode.BadRequest, "Closed account cannot be blocked");

            if (account.Status == AccountStatus.Blocked)
                return new Response<string>(HttpStatusCode.BadRequest, "Account is already blocked");

            account.Status = AccountStatus.Blocked;
            account.IsActive = false;
            db.AuditLogs.Add(CreateAuditLog(account.UserId, "AccountBlocked", ipAddress, userAgent, true));
            await db.SaveChangesAsync();
            await notificationService.SendAsync(account.UserId, "Account blocked", $"Account {account.AccountNumber} has been blocked.", "Account");

            return new Response<string>(HttpStatusCode.OK, "Account blocked successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "BlockAccount failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> CloseAsync(Guid id, string ipAddress, string userAgent, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Account> query = db.Accounts;
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.UserId == requesterUserId.Value);

            var account = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (account == null)
                return new Response<string>(HttpStatusCode.NotFound, "Account not found");

            if (account.Status == AccountStatus.Closed)
                return new Response<string>(HttpStatusCode.BadRequest, "Account is already closed");

            if (account.Balance > 0)
                return new Response<string>(HttpStatusCode.BadRequest, "Cannot close account with positive balance");

            account.Status = AccountStatus.Closed;
            account.IsActive = false;
            db.AuditLogs.Add(CreateAuditLog(account.UserId, "AccountClosed", ipAddress, userAgent, true));
            await db.SaveChangesAsync();

            return new Response<string>(HttpStatusCode.OK, "Account closed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "CloseAccount failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<decimal>> GetBalanceAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Account> query = db.Accounts.AsNoTracking();
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.UserId == requesterUserId.Value);

            var account = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (account == null)
                return new Response<decimal>(HttpStatusCode.NotFound, "Account not found");

            return new Response<decimal>(HttpStatusCode.OK, "Success", account.Balance);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetBalance failed");
            return new Response<decimal>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    private async Task<string> GenerateAccountNumberAsync()
    {
        while (true)
        {
            var digits = string.Concat(Enumerable.Range(0, 18).Select(_ => Random.Shared.Next(0, 10).ToString()));
            var accountNumber = $"TJ{digits}";
            if (!await db.Accounts.AnyAsync(x => x.AccountNumber == accountNumber))
                return accountNumber;
        }
    }

    private static AccountGetDto MapToDto(Account account) => new()
    {
        Id = account.Id,
        AccountNumber = account.AccountNumber,
        Type = account.Type.ToString(),
        Status = account.Status.ToString(),
        Currency = account.Currency.ToString(),
        Balance = account.Balance,
        IsActive = account.IsActive,
        CreatedAt = account.CreatedAt
    };

    private static AuditLog CreateAuditLog(Guid userId, string action, string ipAddress, string userAgent, bool isSuccess) => new()
    {
        UserId = userId,
        Action = action,
        IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress,
        UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
        IsSuccess = isSuccess
    };

    private static PagedResult<T> EmptyPagedResult<T>(int page, int pageSize) => new()
    {
        Items = [],
        Page = page,
        PageSize = pageSize,
        TotalCount = 0,
        TotalPages = 0
    };
}
