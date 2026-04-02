using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SomoniBank.API.Contracts;
using SomoniBank.API.Extensions;
using SomoniBank.Domain.DTOs;
using SomoniBank.Infrastructure.Data;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Responses;
using System.Net;
using System.Security.Claims;

namespace SomoniBank.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    IAuthService authService,
    ISmsVerificationService smsVerificationService,
    IKycService kycService,
    IAccountService accountService,
    AppDbContext dbContext,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<Response<string>>> Register([FromBody] UserInsertDto dto)
        => ToHttpResult(await authService.RegisterAsync(dto));

    [HttpPost("register-with-kyc")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> RegisterWithKyc([FromForm] RegisterWithKycRequest request, CancellationToken cancellationToken)
    {
        var validationError = ValidateRegisterWithKycRequest(request);
        if (validationError != null)
            return StatusCode((int)HttpStatusCode.BadRequest, new Response<string>(HttpStatusCode.BadRequest, validationError));

        var savedFiles = new List<string>();

        try
        {
            var documentFrontUrl = await SaveFileAsync(request.PassportFront!, "front", savedFiles, cancellationToken);
            var documentBackUrl = await SaveFileAsync(request.PassportBack!, "back", savedFiles, cancellationToken);
            var selfieUrl = await SaveFileAsync(request.SelfieWithPassport!, "selfie", savedFiles, cancellationToken);

            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

            var generatedEmail = BuildLoginEmailFromPhone(request.Phone);

            var registerResponse = await authService.RegisterAsync(new UserInsertDto
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = generatedEmail,
                Password = request.Password,
                Phone = request.Phone.Trim(),
                Address = request.Address.Trim(),
                PassportNumber = request.PassportNumber.Trim()
            });

            if (registerResponse.StatusCode >= 400)
            {
                await transaction.RollbackAsync(cancellationToken);
                DeleteSavedFiles(savedFiles);
                return StatusCode(registerResponse.StatusCode, registerResponse);
            }

            var normalizedEmail = generatedEmail.Trim().ToLowerInvariant();
            var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);
            if (user == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                DeleteSavedFiles(savedFiles);
                return StatusCode((int)HttpStatusCode.InternalServerError, new Response<string>(HttpStatusCode.InternalServerError, "User was not found after registration"));
            }

            var accountResponse = await accountService.CreateAsync(user.Id, new AccountInsertDto
            {
                Type = "Current",
                Currency = "TJS"
            }, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown", Request.Headers.UserAgent.ToString());

            if (accountResponse.StatusCode >= 400)
            {
                await transaction.RollbackAsync(cancellationToken);
                DeleteSavedFiles(savedFiles);
                return StatusCode(accountResponse.StatusCode, accountResponse);
            }

            var parsedBirthDate = ParseBirthDate(request.BirthDate);
            var fullName = string.Join(" ", new[] { request.LastName, request.FirstName, request.MiddleName }.Where(x => !string.IsNullOrWhiteSpace(x)));
            var nationalId = string.IsNullOrWhiteSpace(request.NationalIdNumber) ? request.PassportNumber.Trim() : request.NationalIdNumber.Trim();

            var kycResponse = await kycService.SubmitAsync(user.Id, new KycSubmitDto
            {
                FullName = fullName,
                DateOfBirth = parsedBirthDate,
                NationalIdNumber = nationalId,
                PassportNumber = request.PassportNumber.Trim(),
                Address = request.Address.Trim(),
                SelfieImageUrl = selfieUrl,
                DocumentFrontUrl = documentFrontUrl,
                DocumentBackUrl = documentBackUrl
            });

            if (kycResponse.StatusCode >= 400)
            {
                await transaction.RollbackAsync(cancellationToken);
                DeleteSavedFiles(savedFiles);
                return StatusCode(kycResponse.StatusCode, kycResponse);
            }

            await transaction.CommitAsync(cancellationToken);
            return StatusCode((int)HttpStatusCode.OK, new Response<string>(HttpStatusCode.OK, "Registration and KYC submission completed successfully"));
        }
        catch
        {
            DeleteSavedFiles(savedFiles);
            throw;
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<Response<AuthResponseDto>>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.LoginAsync(request, ipAddress, userAgent));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<Response<string>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return ToHttpResult(await authService.ChangePasswordAsync(userId, dto));
    }

    [HttpPost("send-code")]
    public async Task<IActionResult> SendCode([FromBody] SendCodeRequestDto dto, CancellationToken cancellationToken)
    {
        var response = await smsVerificationService.SendCodeAsync(dto.Phone, cancellationToken);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("verify-code")]
    public async Task<ActionResult<VerifyResult>> VerifyCode([FromBody] VerifyCodeRequestDto dto, CancellationToken cancellationToken)
    {
        var response = await smsVerificationService.VerifyCodeAsync(dto.Phone, dto.Code, cancellationToken);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("create-pin")]
    public async Task<ActionResult<Response<AuthResponseDto>>> CreatePin([FromBody] CreatePinRequestDto dto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.CreatePinAsync(dto, ipAddress, userAgent));
    }

    [HttpPost("pin-login")]
    public async Task<ActionResult<Response<AuthResponseDto>>> PinLogin([FromBody] PinLoginRequestDto dto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        return ToHttpResult(await authService.LoginWithPinAsync(dto, ipAddress, userAgent));
    }

    private ActionResult<Response<T>> ToHttpResult<T>(Response<T> response)
        => StatusCode(response.StatusCode, response);

    private string? ValidateRegisterWithKycRequest(RegisterWithKycRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName)
            || string.IsNullOrWhiteSpace(request.LastName)
            || string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.Password)
            || string.IsNullOrWhiteSpace(request.Phone)
            || string.IsNullOrWhiteSpace(request.Address)
            || string.IsNullOrWhiteSpace(request.PassportNumber)
            || string.IsNullOrWhiteSpace(request.BirthDate))
        {
            return "All registration and passport fields are required";
        }

        if (!request.PassportFront.HasAllowedExtension()
            || !request.PassportBack.HasAllowedExtension()
            || !request.SelfieWithPassport.HasAllowedExtension())
        {
            return "Only JPG, PNG, and PDF files are allowed";
        }

        if (request.PassportFront!.Length == 0 || request.PassportBack!.Length == 0 || request.SelfieWithPassport!.Length == 0)
            return "All files must be attached";

        if (request.Password.Trim().Length < 8)
            return "Password must be at least 8 characters long";

        return null;
    }

    private async Task<string> SaveFileAsync(IFormFile file, string prefix, List<string> savedFiles, CancellationToken cancellationToken)
    {
        var uploadsRoot = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", "kyc");
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{prefix}-{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, cancellationToken);

        savedFiles.Add(filePath);
        return $"/uploads/kyc/{fileName}";
    }

    private static void DeleteSavedFiles(IEnumerable<string> files)
    {
        foreach (var file in files)
        {
            if (System.IO.File.Exists(file))
            {
                System.IO.File.Delete(file);
            }
        }
    }

    private static DateTime ParseBirthDate(string value)
    {
        var normalized = value.Replace(" ", string.Empty);
        if (DateTime.TryParseExact(normalized, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var parsed))
            return parsed;

        if (DateTime.TryParse(value, out parsed))
            return parsed;

        throw new InvalidOperationException("Birth date format is invalid");
    }

    private static string BuildLoginEmailFromPhone(string phone)
    {
        var digits = new string((phone ?? string.Empty).Where(char.IsDigit).ToArray());
        return $"{digits}@sbank.local";
    }
}
