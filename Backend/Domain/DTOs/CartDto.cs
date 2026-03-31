using System.ComponentModel.DataAnnotations;

namespace SomoniBank.Domain.DTOs;

public class CardInsertDto
{
    [Required]
    public Guid AccountId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string CardHolderName { get; set; } = null!;

    [Required]
    public string Type { get; set; } = "Physical";
}

public class CardGetDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string Type { get; set; } = null!;
    public string CardNumber { get; set; } = null!;
    public string MaskedNumber { get; set; } = null!;
    public string CardHolderName { get; set; } = null!;
    public string ExpiryDate { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
