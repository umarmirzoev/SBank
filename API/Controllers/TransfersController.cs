using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/transfers")]
[ApiController]
[Authorize]
public class TransfersController(ITransactionService transactionService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string IpAddress => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string UserAgent => Request.Headers.UserAgent.ToString();

    [HttpPost]
    public async Task<Response<string>> Create([FromBody] TransferDto dto)
        => await transactionService.TransferAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpGet("my")]
    public async Task<PagedResult<TransactionGetDto>> GetMyTransfers([FromQuery] PagedQuery pagedQuery)
        => await transactionService.GetAllAsync(new TransactionFilter { Type = "Transfer" }, pagedQuery, CurrentUserId);
}
