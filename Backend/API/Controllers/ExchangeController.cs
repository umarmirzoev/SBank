using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/exchange")]
[ApiController]
[Authorize]
public class ExchangeController(ITransactionService transactionService, ICurrencyRateService currencyRateService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string IpAddress => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string UserAgent => Request.Headers.UserAgent.ToString();

    [HttpPost("convert")]
    public async Task<Response<string>> Convert([FromBody] CurrencyExchangeDto dto)
        => await transactionService.ExchangeCurrencyAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpGet("rates")]
    public async Task<PagedResult<CurrencyRateGetDto>> GetRates([FromQuery] CurrencyRateFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await currencyRateService.GetAllAsync(filter, pagedQuery);
}
