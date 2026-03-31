using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SomoniBank.Domain.DTOs;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/pin")]
[ApiController]
[Authorize]
public class PinController(IAuthService authService) : ControllerBase
{
    [HttpPost("create")]
    public async Task<ActionResult<Response<string>>> Create([FromBody] CreateUserPinRequestDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.CreatePinForUserAsync(userId, dto, ipAddress, userAgent));
    }

    [HttpPost("verify")]
    public async Task<ActionResult<Response<bool>>> Verify([FromBody] VerifyPinRequestDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.VerifyPinAsync(userId, dto, ipAddress, userAgent));
    }

    [HttpPatch("change")]
    public async Task<ActionResult<Response<string>>> Change([FromBody] ChangePinRequestDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.ChangePinAsync(userId, dto, ipAddress, userAgent));
    }

    private ActionResult<Response<T>> ToHttpResult<T>(Response<T> response)
        => StatusCode(response.StatusCode, response);
}
