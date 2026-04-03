using System.ComponentModel.DataAnnotations;

namespace SomoniBank.Domain.DTOs;

public class TransferDto
{
    [Required]
    public Guid FromAccountId { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 4)]
    public string ToAccountNumber { get; set; } = null!;

    [Range(0.01d, 999999999999d)]
    public decimal Amount { get; set; }

    [StringLength(250)]
    public string? Description { get; set; }
}

public class TransferRecipientLookupDto
{
    public string TransferType { get; set; } = null!;
    public string InputValue { get; set; } = null!;
    public string ResolvedAccountNumber { get; set; } = null!;
    public string RecipientName { get; set; } = null!;
    public string MaskedPhone { get; set; } = null!;
    public string? MaskedCardNumber { get; set; }
}

public class DepositMoneyDto
{
    public Guid AccountId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class WithdrawMoneyDto
{
    public Guid AccountId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class TransactionGetDto
{
    public Guid Id { get; set; }
    public Guid? FromAccountId { get; set; }
    public Guid? ToAccountId { get; set; }
    public string? FromAccountNumber { get; set; }
    public string? ToAccountNumber { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
