using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SomoniBank.Domain.Filtres;
using SomoniBank.Domain.DTOs;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController(
    IUserService userService,
    IAccountService accountService,
    ITransactionService transactionService,
    IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet("users")]
    public async Task<PagedResult<UserGetDto>> GetUsers([FromQuery] UserFilter filter, [FromQuery] PagedQuery pagedQuery)
    {
        await LogAdminActionAsync("AdminViewUsers");
        return await userService.GetAllAsync(filter, pagedQuery);
    }

    [HttpGet("accounts")]
    public async Task<PagedResult<AccountGetDto>> GetAccounts([FromQuery] AccountFilter filter, [FromQuery] PagedQuery pagedQuery)
    {
        await LogAdminActionAsync("AdminViewAccounts");
        return await accountService.GetAllAsync(filter, pagedQuery);
    }

    [HttpGet("transactions")]
    public async Task<PagedResult<TransactionGetDto>> GetTransactions([FromQuery] TransactionFilter filter, [FromQuery] PagedQuery pagedQuery)
    {
        await LogAdminActionAsync("AdminViewTransactions");
        return await transactionService.GetAllAsync(filter, pagedQuery, null, true);
    }

    private async Task LogAdminActionAsync(string action)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        await auditLogService.LogAsync(userId, action, ipAddress, userAgent, true);
    }
}
