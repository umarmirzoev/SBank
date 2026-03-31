using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.API.Controllers;

[Route("api/transaction")]
[Route("api/transactions")]
[ApiController]
[Authorize]
public class TransactionController(ITransactionService transactionService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private bool IsAdmin => User.IsInRole("Admin");
    private string IpAddress => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    private string UserAgent => Request.Headers.UserAgent.ToString();

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResult<TransactionGetDto>> GetAll([FromQuery] TransactionFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await transactionService.GetAllAsync(filter, pagedQuery, CurrentUserId, IsAdmin);

    [HttpGet("{id}")]
    public async Task<Response<TransactionGetDto>> GetById(Guid id)
        => await transactionService.GetByIdAsync(id, CurrentUserId, IsAdmin);

    [HttpGet("my")]
    public async Task<PagedResult<TransactionGetDto>> GetMyTransactions([FromQuery] TransactionFilter filter, [FromQuery] PagedQuery pagedQuery)
        => await transactionService.GetAllAsync(filter, pagedQuery, CurrentUserId);

    [HttpGet("recent")]
    public async Task<PagedResult<TransactionGetDto>> GetRecentTransactions()
        => await transactionService.GetAllAsync(new TransactionFilter(), new PagedQuery { Page = 1, PageSize = 10 }, CurrentUserId);

    [HttpPost("transfer")]
    public async Task<Response<string>> Transfer([FromBody] TransferDto dto)
        => await transactionService.TransferAsync(CurrentUserId, dto, IpAddress, UserAgent);

    [HttpPost("deposit")]
    public async Task<Response<string>> DepositMoney([FromBody] DepositMoneyDto dto)
        => await transactionService.DepositMoneyAsync(CurrentUserId, dto);

    [HttpPost("withdraw")]
    public async Task<Response<string>> WithdrawMoney([FromBody] WithdrawMoneyDto dto)
        => await transactionService.WithdrawMoneyAsync(CurrentUserId, dto);

    [HttpPost("exchange")]
    public async Task<Response<string>> ExchangeCurrency([FromBody] CurrencyExchangeDto dto)
        => await transactionService.ExchangeCurrencyAsync(CurrentUserId, dto, IpAddress, UserAgent);
}
