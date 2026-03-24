using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/account")]
[Route("api/accounts")]
[ApiController]
[Authorize]
public class AccountController(IAccountService accountService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private bool IsAdmin => User.IsInRole("Admin");
    private string IpAddress => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string UserAgent => Request.Headers.UserAgent.ToString();

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResult<AccountGetDto>> GetAll([FromQuery] AccountFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await accountService.GetAllAsync(filter, pagedQuery);

    [HttpGet("{id}")]
    public async Task<Response<AccountGetDto>> GetById(Guid id)
        => await accountService.GetByIdAsync(id, CurrentUserId, IsAdmin);

    [HttpGet("{id}/balance")]
    public async Task<Response<decimal>> GetBalance(Guid id)
        => await accountService.GetBalanceAsync(id, CurrentUserId, IsAdmin);

    [HttpGet("my")]
    public async Task<PagedResult<AccountGetDto>> GetMyAccounts([FromQuery] PagedQuery pagedQuery)
    {
        var filter = new AccountFilter { UserId = CurrentUserId };
        return await accountService.GetAllAsync(filter, pagedQuery);
    }

    [HttpPost]
    public async Task<Response<AccountGetDto>> Create([FromBody] AccountInsertDto dto)
        => await accountService.CreateAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpPost("open")]
    public async Task<Response<AccountGetDto>> Open([FromBody] AccountInsertDto dto)
        => await accountService.CreateAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpPatch("{id}/block")]
    public async Task<Response<string>> Block(Guid id)
        => await accountService.BlockAsync(id, IpAddress, UserAgent, CurrentUserId, IsAdmin);

    [HttpPatch("{id}/close")]
    public async Task<Response<string>> Close(Guid id)
        => await accountService.CloseAsync(id, IpAddress, UserAgent, CurrentUserId, IsAdmin);
}
