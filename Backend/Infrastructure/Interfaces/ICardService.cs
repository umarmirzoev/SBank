using SomoniBank.Domain.DTOs;
using SomoniBank.Domain.Filtres;
using SomoniBank.Infrastructure.Responses;

namespace SomoniBank.Infrastructure.Interfaces;

public interface ICardService
{
    Task<Response<CardGetDto>> GetByIdAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false);
    Task<PagedResult<CardGetDto>> GetAllAsync(CardFilter filter, PagedQuery pagedQuery);
    Task<Response<CardGetDto>> CreateAsync(Guid userId, CardInsertDto dto, string ipAddress, string userAgent);
    Task<Response<string>> BlockAsync(Guid id, string ipAddress, string userAgent, Guid? requesterUserId = null, bool isAdmin = false);
    Task<Response<string>> UnblockAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false);
    Task<Response<string>> DeleteAsync(Guid id, Guid? requesterUserId = null, bool isAdmin = false);
}
