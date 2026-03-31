using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/card")]
[Route("api/cards")]
[ApiController]
[Authorize]
public class CardController(ICardService cardService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private bool IsAdmin => User.IsInRole("Admin");
    private string IpAddress => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string UserAgent => Request.Headers.UserAgent.ToString();

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResult<CardGetDto>> GetAll([FromQuery] CardFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await cardService.GetAllAsync(filter, pagedQuery);

    [HttpGet("{id}")]
    public async Task<Response<CardGetDto>> GetById(Guid id)
        => await cardService.GetByIdAsync(id, CurrentUserId, IsAdmin);

    [HttpGet("my")]
    public async Task<PagedResult<CardGetDto>> GetMyCards([FromQuery] PagedQuery pagedQuery)
    {
        var filter = new CardFilter { UserId = CurrentUserId };
        return await cardService.GetAllAsync(filter, pagedQuery);
    }

    [HttpPost]
    public async Task<Response<CardGetDto>> Create([FromBody] CardInsertDto dto)
        => await cardService.CreateAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpPost("create")]
    public async Task<Response<CardGetDto>> CreateFriendly([FromBody] CardInsertDto dto)
        => await cardService.CreateAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpPatch("{id}/block")]
    public async Task<Response<string>> Block(Guid id)
        => await cardService.BlockAsync(id, IpAddress, UserAgent, CurrentUserId, IsAdmin);

    [HttpPatch("{id}/unblock")]
    public async Task<Response<string>> Unblock(Guid id)
        => await cardService.UnblockAsync(id, CurrentUserId, IsAdmin);

    [HttpDelete("{id}")]
    public async Task<Response<string>> Delete(Guid id)
        => await cardService.DeleteAsync(id, CurrentUserId, IsAdmin);
}
