using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResult<UserGetDto>> GetAll([FromQuery] UserFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await userService.GetAllAsync(filter, pagedQuery);

    [HttpGet("{id}")]
    public async Task<ActionResult<Response<UserGetDto>>> GetById(Guid id)
    {
        var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && currentUserId != id)
            return StatusCode(StatusCodes.Status403Forbidden, new Response<UserGetDto>(System.Net.HttpStatusCode.Forbidden, "You can only view your own profile"));

        var response = await userService.GetByIdAsync(id);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("me")]
    public async Task<Response<UserGetDto>> GetMe()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return await userService.GetByIdAsync(userId);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Response<string>>> Update(Guid id, UserUpdateDto dto)
    {
        var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && currentUserId != id)
            return StatusCode(StatusCodes.Status403Forbidden, new Response<string>(System.Net.HttpStatusCode.Forbidden, "You can only update your own profile"));

        var response = await userService.UpdateAsync(id, dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<Response<string>> Delete(Guid id)
        => await userService.DeleteAsync(id);

    [HttpPatch("{id}/block")]
    [Authorize(Roles = "Admin")]
    public async Task<Response<string>> Block(Guid id)
        => await userService.BlockAsync(id);

    [HttpPatch("{id}/unblock")]
    [Authorize(Roles = "Admin")]
    public async Task<Response<string>> Unblock(Guid id)
        => await userService.UnblockAsync(id);
}
