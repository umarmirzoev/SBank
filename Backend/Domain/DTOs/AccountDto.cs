using System.ComponentModel.DataAnnotations;

namespace SomoniBank.Domain.DTOs;

public class AccountInsertDto
{
    [Required]
    public string Type { get; set; } = null!;

    [Required]
    public string Currency { get; set; } = null!;
 }
//eeeeev
public class AccountGetDto
{
    public Guid Id { get; set; }
    public string AccountNumber { get; set; } = null!;
    public string Iban { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Currency { get; set; } = null!;
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
