using System.Net;
using System.Text.RegularExpressions;
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

public class TransactionService(
    AppDbContext db,
    IFraudDetectionService fraudDetectionService,
    INotificationService notificationService,
    ISmsSender smsSender,
    ILogger<TransactionService> logger) : ITransactionService
{
    private static readonly Regex TajikPhoneRegex = new(@"^\+992\d{9}$", RegexOptions.Compiled);

    public async Task<Response<TransactionGetDto>> GetByIdAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Transaction> query = db.Transactions.AsNoTracking()
                .Include(x => x.FromAccount)
                .Include(x => x.ToAccount);

            if (!isAdmin && requesterUserId.HasValue)
            {
                query = query.Where(x =>
                    (x.FromAccount != null && x.FromAccount.UserId == requesterUserId.Value) ||
                    (x.ToAccount != null && x.ToAccount.UserId == requesterUserId.Value));
            }

            var transaction = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (transaction == null)
                return new Response<TransactionGetDto>(HttpStatusCode.NotFound, "Transaction not found");

            return new Response<TransactionGetDto>(HttpStatusCode.OK, "Success", MapToDto(transaction));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetTransactionById failed");
            return new Response<TransactionGetDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<TransferRecipientLookupDto>> ResolveRecipientAsync(Guid userId, string transferType, string value)
    {
        try
        {
            var normalizedType = (transferType ?? string.Empty).Trim().ToLowerInvariant();
            var normalizedValue = value?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(normalizedValue))
            {
                return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Recipient value is required");
            }

            return normalizedType switch
            {
                "card" => await ResolveByCardAsync(userId, normalizedValue),
                "phone" => await ResolveByPhoneAsync(userId, normalizedValue),
                "requisites" => await ResolveByAccountNumberAsync(userId, normalizedValue),
                _ => new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Unsupported transfer type")
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ResolveRecipient failed");
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<PagedResult<TransactionGetDto>> GetAllAsync(TransactionFilter filter, PagedQuery pagedQuery, Guid? requesterUserId = null, bool isAdmin = false)
    {
        var page = pagedQuery.Page <= 0 ? 1 : pagedQuery.Page;
        var pageSize = pagedQuery.PageSize <= 0 ? 10 : pagedQuery.PageSize;

        IQueryable<Transaction> query = db.Transactions.AsNoTracking()
            .Include(x => x.FromAccount)
            .Include(x => x.ToAccount);

        if (!isAdmin && requesterUserId.HasValue)
        {
            query = query.Where(x =>
                (x.FromAccount != null && x.FromAccount.UserId == requesterUserId.Value) ||
                (x.ToAccount != null && x.ToAccount.UserId == requesterUserId.Value));
        }

        if (filter?.AccountId != null)
            query = query.Where(x => x.FromAccountId == filter.AccountId || x.ToAccountId == filter.AccountId);

        if (!string.IsNullOrWhiteSpace(filter?.Type) && Enum.TryParse<TransactionType>(filter.Type, true, out var transactionType))
            query = query.Where(x => x.Type == transactionType);

        if (!string.IsNullOrWhiteSpace(filter?.Status) && Enum.TryParse<TransactionStatus>(filter.Status, true, out var transactionStatus))
            query = query.Where(x => x.Status == transactionStatus);

        if (filter?.FromDate != null)
            query = query.Where(x => x.CreatedAt >= filter.FromDate);
        if (filter?.ToDate != null)
            query = query.Where(x => x.CreatedAt <= filter.ToDate);
        if (filter?.MinAmount != null)
            query = query.Where(x => x.Amount >= filter.MinAmount);
        if (filter?.MaxAmount != null)
            query = query.Where(x => x.Amount <= filter.MaxAmount);

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<TransactionGetDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<Response<string>> TransferAsync(Guid userId, TransferDto dto, string ipAddress, string userAgent)
    {
        await using var dbTransaction = await db.Database.BeginTransactionAsync();
        try
        {
            if (dto == null)
                return new Response<string>(HttpStatusCode.BadRequest, "Transfer request is required");
            if (dto.FromAccountId == Guid.Empty)
                return new Response<string>(HttpStatusCode.BadRequest, "Invalid source account id");
            if (string.IsNullOrWhiteSpace(dto.ToAccountNumber))
                return new Response<string>(HttpStatusCode.BadRequest, "Destination account is required");
            if (dto.Amount <= 0)
                return new Response<string>(HttpStatusCode.BadRequest, "Transfer amount must be greater than zero");

            var fromAccount = await db.Accounts
                .FirstOrDefaultAsync(x => x.Id == dto.FromAccountId && x.UserId == userId);
            if (fromAccount == null)
            {
                await LogAuditAsync(userId, "TransferFailed", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", "Source account was not found.", "Transfer");
                return new Response<string>(HttpStatusCode.NotFound, "Source account not found");
            }

            if (!fromAccount.IsActive || fromAccount.Status != AccountStatus.Active)
            {
                await notificationService.SendAsync(userId, "Transfer failed", "Source account is not active.", "Transfer");
                return new Response<string>(HttpStatusCode.BadRequest, "Source account is not active");
            }

            if (fromAccount.Balance < dto.Amount)
            {
                await LogAuditAsync(userId, "TransferFailed", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", "Insufficient balance for transfer.", "Transfer");
                return new Response<string>(HttpStatusCode.BadRequest, "Insufficient balance");
            }

            var sourceLimit = await GetOrCreateTransactionLimitAsync(fromAccount.Id);
            ResetDailyUsageIfNeeded(sourceLimit);

            if (dto.Amount > sourceLimit.SingleTransactionLimit)
            {
                await LogAuditAsync(userId, "TransferLimitViolation", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", "Per-transaction transfer limit exceeded.", "Transfer");
                return new Response<string>(HttpStatusCode.BadRequest, $"Per-transaction limit exceeded. Maximum allowed is {sourceLimit.SingleTransactionLimit}");
            }

            if (sourceLimit.UsedTodayAmount + dto.Amount > sourceLimit.DailyLimit)
            {
                await LogAuditAsync(userId, "TransferLimitViolation", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", "Daily transfer limit exceeded.", "Transfer");
                return new Response<string>(HttpStatusCode.BadRequest, $"Daily transfer limit exceeded. Remaining available amount is {Math.Max(0m, sourceLimit.DailyLimit - sourceLimit.UsedTodayAmount)}");
            }

            var toAccount = await db.Accounts.FirstOrDefaultAsync(x => x.AccountNumber == dto.ToAccountNumber.Trim());
            if (toAccount == null)
            {
                await LogAuditAsync(userId, "TransferFailed", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", "Destination account was not found.", "Transfer");
                return new Response<string>(HttpStatusCode.NotFound, "Destination account not found");
            }

            if (toAccount.Id == fromAccount.Id)
                return new Response<string>(HttpStatusCode.BadRequest, "Cannot transfer to the same account");

            if (!toAccount.IsActive || toAccount.Status != AccountStatus.Active)
            {
                await notificationService.SendAsync(userId, "Transfer failed", "Destination account is not active.", "Transfer");
                return new Response<string>(HttpStatusCode.BadRequest, "Destination account is not active");
            }

            var fraudCheck = await fraudDetectionService.EvaluateTransferAsync(userId, fromAccount, dto.Amount, dto.Description);
            if (fraudCheck.IsBlocked)
            {
                await LogAuditAsync(userId, "TransferFailed", ipAddress, userAgent, false);
                await notificationService.SendAsync(userId, "Transfer failed", $"Transfer blocked by fraud monitoring: {fraudCheck.Reason}", "Transfer");
                return new Response<string>(HttpStatusCode.Forbidden, $"Transfer blocked by fraud monitoring: {fraudCheck.Reason}");
            }

            fromAccount.Balance -= dto.Amount;
            toAccount.Balance += dto.Amount;
            sourceLimit.UsedTodayAmount += dto.Amount;
            sourceLimit.UpdatedAt = DateTime.UtcNow;

            db.Transactions.Add(new Transaction
            {
                FromAccountId = fromAccount.Id,
                ToAccountId = toAccount.Id,
                Amount = dto.Amount,
                Currency = fromAccount.Currency,
                Type = TransactionType.Transfer,
                Status = TransactionStatus.Completed,
                Description = string.IsNullOrWhiteSpace(dto.Description) ? "Transfer" : dto.Description.Trim()
            });

            db.AuditLogs.Add(CreateAuditLog(userId, "TransferCompleted", ipAddress, userAgent, true));

            await db.SaveChangesAsync();
            await dbTransaction.CommitAsync();
            await notificationService.SendAsync(userId, "Transfer successful", $"Transfer of {dto.Amount} {fromAccount.Currency} to {toAccount.AccountNumber} completed successfully.", "Transfer");
            await notificationService.SendAsync(toAccount.UserId, "Incoming transfer", $"You received {dto.Amount} {fromAccount.Currency} from account {fromAccount.AccountNumber}.", "Transfer");
            await SendTransferSmsAsync(fromAccount, toAccount, dto.Amount, dto.Description);

            return new Response<string>(HttpStatusCode.OK, "Transfer completed successfully");
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            logger.LogError(ex, "Transfer failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> DepositMoneyAsync(Guid userId, DepositMoneyDto dto)
    {
        await using var dbTransaction = await db.Database.BeginTransactionAsync();
        try
        {
            var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == dto.AccountId && x.UserId == userId);
            if (account == null)
                return new Response<string>(HttpStatusCode.NotFound, "Account not found");

            if (!account.IsActive)
                return new Response<string>(HttpStatusCode.BadRequest, "Account is blocked");

            account.Balance += dto.Amount;

            db.Transactions.Add(new Transaction
            {
                ToAccountId = account.Id,
                Amount = dto.Amount,
                Currency = account.Currency,
                Type = TransactionType.Deposit,
                Status = TransactionStatus.Completed,
                Description = dto.Description ?? "Account top up"
            });

            await db.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return new Response<string>(HttpStatusCode.OK, $"Account topped up by {dto.Amount}");
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            logger.LogError(ex, "DepositMoney failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> WithdrawMoneyAsync(Guid userId, WithdrawMoneyDto dto)
    {
        await using var dbTransaction = await db.Database.BeginTransactionAsync();
        try
        {
            var account = await db.Accounts.FirstOrDefaultAsync(x => x.Id == dto.AccountId && x.UserId == userId);
            if (account == null)
                return new Response<string>(HttpStatusCode.NotFound, "Account not found");

            if (!account.IsActive)
                return new Response<string>(HttpStatusCode.BadRequest, "Account is blocked");

            if (account.Balance < dto.Amount)
                return new Response<string>(HttpStatusCode.BadRequest, "Insufficient funds");

            account.Balance -= dto.Amount;

            db.Transactions.Add(new Transaction
            {
                FromAccountId = account.Id,
                Amount = dto.Amount,
                Currency = account.Currency,
                Type = TransactionType.Withdrawal,
                Status = TransactionStatus.Completed,
                Description = dto.Description ?? "Cash withdrawal"
            });

            await db.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return new Response<string>(HttpStatusCode.OK, $"Withdrawn {dto.Amount}");
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            logger.LogError(ex, "WithdrawMoney failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> ExchangeCurrencyAsync(Guid userId, CurrencyExchangeDto dto, string ipAddress, string userAgent)
    {
        await using var dbTransaction = await db.Database.BeginTransactionAsync();
        try
        {
            var fromAccount = await db.Accounts.FirstOrDefaultAsync(x => x.Id == dto.FromAccountId && x.UserId == userId);
            if (fromAccount == null)
                return new Response<string>(HttpStatusCode.NotFound, "Sender account not found");

            var toAccount = await db.Accounts.FirstOrDefaultAsync(x => x.Id == dto.ToAccountId && x.UserId == userId);
            if (toAccount == null)
                return new Response<string>(HttpStatusCode.NotFound, "Recipient account not found");

            if (fromAccount.Currency == toAccount.Currency)
                return new Response<string>(HttpStatusCode.BadRequest, "Accounts use the same currency");

            if (!fromAccount.IsActive || fromAccount.Status != AccountStatus.Active)
                return new Response<string>(HttpStatusCode.BadRequest, "Source account is not active");

            if (!toAccount.IsActive || toAccount.Status != AccountStatus.Active)
                return new Response<string>(HttpStatusCode.BadRequest, "Destination account is not active");

            if (fromAccount.Balance < dto.Amount)
                return new Response<string>(HttpStatusCode.BadRequest, "Insufficient funds");

            var rate = await db.CurrencyRates
                .FirstOrDefaultAsync(x => x.FromCurrency == fromAccount.Currency && x.ToCurrency == toAccount.Currency);
            if (rate == null)
                return new Response<string>(HttpStatusCode.NotFound, "Exchange rate not found");

            var convertedAmount = dto.Amount * rate.Rate;
            fromAccount.Balance -= dto.Amount;
            toAccount.Balance += convertedAmount;

            db.Transactions.Add(new Transaction
            {
                FromAccountId = fromAccount.Id,
                ToAccountId = toAccount.Id,
                Amount = dto.Amount,
                Currency = fromAccount.Currency,
                Type = TransactionType.Transfer,
                Status = TransactionStatus.Completed,
                Description = $"Currency exchange: {dto.Amount} {fromAccount.Currency} -> {convertedAmount:F2} {toAccount.Currency}"
            });

            db.AuditLogs.Add(CreateAuditLog(userId, "CurrencyExchangeCompleted", ipAddress, userAgent, true));

            await db.SaveChangesAsync();
            await dbTransaction.CommitAsync();
            await notificationService.SendAsync(userId, "Currency exchange", $"Converted {dto.Amount} {fromAccount.Currency} into {convertedAmount:F2} {toAccount.Currency}.", "Exchange");

            return new Response<string>(HttpStatusCode.OK, $"Currency exchange completed. Received: {convertedAmount:F2} {toAccount.Currency}");
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            logger.LogError(ex, "ExchangeCurrency failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    private async Task LogAuditAsync(Guid userId, string action, string ipAddress, string userAgent, bool isSuccess)
    {
        db.AuditLogs.Add(CreateAuditLog(userId, action, ipAddress, userAgent, isSuccess));
        await db.SaveChangesAsync();
    }

    private async Task<Response<TransferRecipientLookupDto>> ResolveByCardAsync(Guid userId, string rawCardNumber)
    {
        var cardNumber = new string(rawCardNumber.Where(char.IsDigit).ToArray());
        if (cardNumber.Length != 12)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Card number must contain 12 digits");
        }

        var recipient = await db.Cards.AsNoTracking()
            .Include(x => x.Account)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.CardNumber == cardNumber &&
                x.Status == CardStatus.Active &&
                x.Account.IsActive &&
                x.Account.Status == AccountStatus.Active);

        if (recipient == null)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.NotFound, "Recipient card was not found");
        }

        if (recipient.Account.UserId == userId)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Cannot transfer to your own card");
        }

        return new Response<TransferRecipientLookupDto>(
            HttpStatusCode.OK,
            "Recipient found",
            BuildLookupDto("card", cardNumber, recipient.Account.AccountNumber, recipient.Account.User, recipient.CardNumber));
    }

    private async Task<Response<TransferRecipientLookupDto>> ResolveByPhoneAsync(Guid userId, string rawPhone)
    {
        var phone = NormalizePhone(rawPhone);
        if (!TajikPhoneRegex.IsMatch(phone))
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Phone number must be in +992XXXXXXXXX format");
        }

        var recipientAccount = await db.Accounts.AsNoTracking()
            .Include(x => x.User)
            .Where(x =>
                x.User.Phone == phone &&
                x.IsActive &&
                x.Status == AccountStatus.Active &&
                x.Currency == Currency.TJS)
            .OrderBy(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (recipientAccount == null)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.NotFound, "Recipient phone was not found");
        }

        if (recipientAccount.UserId == userId)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Cannot transfer to your own phone");
        }

        return new Response<TransferRecipientLookupDto>(
            HttpStatusCode.OK,
            "Recipient found",
            BuildLookupDto("phone", phone, recipientAccount.AccountNumber, recipientAccount.User, null));
    }

    private async Task<Response<TransferRecipientLookupDto>> ResolveByAccountNumberAsync(Guid userId, string accountNumber)
    {
        var normalizedAccountNumber = accountNumber.Trim();
        var recipientAccount = await db.Accounts.AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.AccountNumber == normalizedAccountNumber &&
                x.IsActive &&
                x.Status == AccountStatus.Active);

        if (recipientAccount == null)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.NotFound, "Recipient account was not found");
        }

        if (recipientAccount.UserId == userId)
        {
            return new Response<TransferRecipientLookupDto>(HttpStatusCode.BadRequest, "Cannot transfer to your own account");
        }

        return new Response<TransferRecipientLookupDto>(
            HttpStatusCode.OK,
            "Recipient found",
            BuildLookupDto("requisites", normalizedAccountNumber, recipientAccount.AccountNumber, recipientAccount.User, null));
    }

    private static TransferRecipientLookupDto BuildLookupDto(string transferType, string inputValue, string accountNumber, User user, string? cardNumber)
        => new()
        {
            TransferType = transferType,
            InputValue = inputValue,
            ResolvedAccountNumber = accountNumber,
            RecipientName = $"{user.FirstName} {user.LastName}".Trim(),
            MaskedPhone = MaskPhone(user.Phone),
            MaskedCardNumber = string.IsNullOrWhiteSpace(cardNumber) ? null : MaskCard(cardNumber)
        };

    private static string NormalizePhone(string phone)
    {
        var normalized = phone.Trim()
            .Replace(" ", string.Empty)
            .Replace("-", string.Empty)
            .Replace("(", string.Empty)
            .Replace(")", string.Empty);

        if (normalized.StartsWith("00", StringComparison.Ordinal))
        {
            normalized = "+" + normalized[2..];
        }

        return normalized;
    }

    private static string MaskPhone(string phone)
    {
        if (phone.Length < 4)
        {
            return phone;
        }

        return $"{phone[..4]} *** ** {phone[^2..]}";
    }

    private static string MaskCard(string cardNumber)
    {
        if (cardNumber.Length <= 4)
        {
            return cardNumber;
        }

        return $"**** **** {cardNumber[^4..]}";
    }

    private async Task SendTransferSmsAsync(Account fromAccount, Account toAccount, decimal amount, string? description)
    {
        var participantIds = new[] { fromAccount.UserId, toAccount.UserId };
        var users = await db.Users.AsNoTracking()
            .Where(x => participantIds.Contains(x.Id))
            .Select(x => new
            {
                x.Id,
                x.Phone,
                FullName = $"{x.FirstName} {x.LastName}".Trim()
            })
            .ToListAsync();

        var sender = users.FirstOrDefault(x => x.Id == fromAccount.UserId);
        var recipient = users.FirstOrDefault(x => x.Id == toAccount.UserId);
        var timestamp = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
        var amountText = $"{amount:0.##} {fromAccount.Currency}";
        var recipientName = string.IsNullOrWhiteSpace(recipient?.FullName) ? toAccount.AccountNumber : recipient.FullName;
        var senderName = string.IsNullOrWhiteSpace(sender?.FullName) ? fromAccount.AccountNumber : sender.FullName;
        var senderSms = $"Перевод выполнен {timestamp}. Получатель: {recipientName}. Сумма: {amountText}.";
        var recipientSms = $"Зачисление {timestamp}. Отправитель: {senderName}. Сумма: {amountText}.";

        if (!string.IsNullOrWhiteSpace(description))
        {
            senderSms += $" Комментарий: {description.Trim()}.";
        }

        var smsTasks = new List<Task>(2);

        if (!string.IsNullOrWhiteSpace(sender?.Phone))
        {
            smsTasks.Add(smsSender.SendAsync(sender.Phone, senderSms));
        }

        if (!string.IsNullOrWhiteSpace(recipient?.Phone))
        {
            smsTasks.Add(smsSender.SendAsync(recipient.Phone, recipientSms));
        }

        if (smsTasks.Count > 0)
        {
            await Task.WhenAll(smsTasks);
        }
    }

    private async Task<TransactionLimit> GetOrCreateTransactionLimitAsync(Guid accountId)
    {
        var limit = await db.TransactionLimits.FirstOrDefaultAsync(x => x.AccountId == accountId);
        if (limit != null)
            return limit;

        limit = new TransactionLimit
        {
            AccountId = accountId
        };

        db.TransactionLimits.Add(limit);
        return limit;
    }

    private static void ResetDailyUsageIfNeeded(TransactionLimit limit)
    {
        if (limit.LastResetDate.Date >= DateTime.UtcNow.Date)
            return;

        limit.UsedTodayAmount = 0;
        limit.LastResetDate = DateTime.UtcNow.Date;
        limit.UpdatedAt = DateTime.UtcNow;
    }

    private static TransactionGetDto MapToDto(Transaction transaction) => new()
    {
        Id = transaction.Id,
        FromAccountId = transaction.FromAccountId,
        ToAccountId = transaction.ToAccountId,
        FromAccountNumber = transaction.FromAccount?.AccountNumber,
        ToAccountNumber = transaction.ToAccount?.AccountNumber,
        Amount = transaction.Amount,
        Currency = transaction.Currency.ToString(),
        Type = transaction.Type.ToString(),
        Status = transaction.Status.ToString(),
        Description = transaction.Description,
        CreatedAt = transaction.CreatedAt
    };

    private static AuditLog CreateAuditLog(Guid userId, string action, string ipAddress, string userAgent, bool isSuccess) => new()
    {
        UserId = userId,
        Action = action,
        IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress,
        UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
        IsSuccess = isSuccess
    };
}
