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

public class CardService : ICardService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;
    private readonly ILogger<CardService> _logger;

    public CardService(AppDbContext db, INotificationService notificationService, ILogger<CardService> logger)
    {
        _db = db;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Response<CardGetDto>> GetByIdAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Card> query = _db.Cards.AsNoTracking()
                .Include(x => x.Account);

            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.Account.UserId == requesterUserId.Value);

            var card = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (card == null)
                return new Response<CardGetDto>(HttpStatusCode.NotFound, "Card not found");

            return new Response<CardGetDto>(HttpStatusCode.OK, "Success", MapToDto(card));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetCardById failed");
            return new Response<CardGetDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<PagedResult<CardGetDto>> GetAllAsync(CardFilter filter, PagedQuery pagedQuery)
    {
        var page = pagedQuery.Page <= 0 ? 1 : pagedQuery.Page;
        var pageSize = pagedQuery.PageSize <= 0 ? 10 : pagedQuery.PageSize;

        IQueryable<Card> query = _db.Cards.AsNoTracking()
            .Include(x => x.Account);

        if (filter?.UserId != null)
            query = query.Where(x => x.Account.UserId == filter.UserId.Value);
        if (filter?.AccountId != null)
            query = query.Where(x => x.AccountId == filter.AccountId.Value);
        if (!string.IsNullOrWhiteSpace(filter?.Type) && Enum.TryParse<CardType>(filter.Type, true, out var cardType))
            query = query.Where(x => x.Type == cardType);
        if (!string.IsNullOrWhiteSpace(filter?.Status) && Enum.TryParse<CardStatus>(filter.Status, true, out var cardStatus))
            query = query.Where(x => x.Status == cardStatus);

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<CardGetDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<Response<CardGetDto>> CreateAsync(Guid userId, CardInsertDto dto, string ipAddress, string userAgent)
    {
        try
        {
            if (dto == null || dto.AccountId == Guid.Empty || string.IsNullOrWhiteSpace(dto.CardHolderName))
                return new Response<CardGetDto>(HttpStatusCode.BadRequest, "Account and card holder name are required");

            if (!Enum.TryParse<CardType>(dto.Type, true, out var cardType))
                return new Response<CardGetDto>(HttpStatusCode.BadRequest, "Invalid card type");

            var account = await _db.Accounts
                .FirstOrDefaultAsync(x => x.Id == dto.AccountId && x.UserId == userId);
            if (account == null)
                return new Response<CardGetDto>(HttpStatusCode.NotFound, "Account not found");

            if (!account.IsActive || account.Status != AccountStatus.Active)
                return new Response<CardGetDto>(HttpStatusCode.BadRequest, "Cards can only be created for active accounts");

            var card = new Card
            {
                AccountId = dto.AccountId,
                Type = cardType,
                CardNumber = GenerateCardNumber(),
                CardHolderName = dto.CardHolderName.Trim().ToUpperInvariant(),
                ExpiryDate = $"{DateTime.UtcNow.AddYears(3):MM/yy}",
                Cvv = GenerateCvv(),
                Status = CardStatus.Active
            };

            _db.Cards.Add(card);
            _db.AuditLogs.Add(CreateAuditLog(userId, "CardCreated", ipAddress, userAgent, true));
            await _db.SaveChangesAsync();
            await _notificationService.SendAsync(userId, "Card created", $"Your {card.Type.ToString().ToLowerInvariant()} card {MaskCardNumber(card.CardNumber)} was created.", "Card");

            return new Response<CardGetDto>(HttpStatusCode.OK, "Card created successfully", MapToDto(card));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateCard failed");
            return new Response<CardGetDto>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> BlockAsync(Guid id, string ipAddress, string userAgent, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Card> query = _db.Cards.Include(x => x.Account);
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.Account.UserId == requesterUserId.Value);

            var card = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (card == null)
                return new Response<string>(HttpStatusCode.NotFound, "Card not found");

            if (card.Status == CardStatus.Blocked)
                return new Response<string>(HttpStatusCode.BadRequest, "Card is already blocked");

            card.Status = CardStatus.Blocked;
            _db.AuditLogs.Add(CreateAuditLog(card.Account.UserId, "CardBlocked", ipAddress, userAgent, true));
            await _db.SaveChangesAsync();
            await _notificationService.SendAsync(card.Account.UserId, "Card blocked", $"Your card {MaskCardNumber(card.CardNumber)} was blocked.", "Card");

            return new Response<string>(HttpStatusCode.OK, "Card blocked successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BlockCard failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> UnblockAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Card> query = _db.Cards.Include(x => x.Account);
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.Account.UserId == requesterUserId.Value);

            var card = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (card == null)
                return new Response<string>(HttpStatusCode.NotFound, "Card not found");

            card.Status = CardStatus.Active;
            await _db.SaveChangesAsync();
            return new Response<string>(HttpStatusCode.OK, "Card unblocked successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UnblockCard failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    public async Task<Response<string>> DeleteAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false)
    {
        try
        {
            IQueryable<Card> query = _db.Cards.Include(x => x.Account);
            if (!isAdmin && requesterUserId.HasValue)
                query = query.Where(x => x.Account.UserId == requesterUserId.Value);

            var card = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (card == null)
                return new Response<string>(HttpStatusCode.NotFound, "Card not found");

            _db.Cards.Remove(card);
            await _db.SaveChangesAsync();
            return new Response<string>(HttpStatusCode.OK, "Card deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeleteCard failed");
            return new Response<string>(HttpStatusCode.InternalServerError, "Something went wrong");
        }
    }

    private static string GenerateCardNumber()
    {
        var random = new Random();
        return $"4{random.Next(100, 999)}{random.Next(1000, 9999)}{random.Next(1000, 9999)}{random.Next(1000, 9999)}";
    }

    private static string GenerateCvv()
    {
        var random = new Random();
        return random.Next(100, 999).ToString();
    }

    private static string MaskCardNumber(string cardNumber)
        => $"**** **** **** {cardNumber[^4..]}";

    private static CardGetDto MapToDto(Card card) => new()
    {
        Id = card.Id,
        AccountId = card.AccountId,
        Type = card.Type.ToString(),
        CardNumber = MaskCardNumber(card.CardNumber),
        MaskedNumber = MaskCardNumber(card.CardNumber),
        FullCardNumber = card.CardNumber,
        CardHolderName = card.CardHolderName,
        ExpiryDate = card.ExpiryDate,
        Cvv = card.Cvv,
        Status = card.Status.ToString(),
        CreatedAt = card.CreatedAt
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
