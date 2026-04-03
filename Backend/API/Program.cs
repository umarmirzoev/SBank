using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.IO;
using SomoniBank.Domain.Enums;
using SomoniBank.Domain.Models;
using SomoniBank.Infrastructure.Data;
using SomoniBank.Infrastructure.Interfaces;
using SomoniBank.Infrastructure.Services;
using SomoniBank.API.MiddleWares;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtectionKeys")));

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISmsVerificationService, SmsVerificationService>();
builder.Services.AddScoped<ISmsSender, MockSmsSender>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IDepositService, DepositService>();
builder.Services.AddScoped<ILoanService, LoanService>();
builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<ICurrencyRateService, CurrencyRateService>();
builder.Services.AddScoped<IExchangeRateService, ExchangeRateService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ITransactionLimitService, TransactionLimitService>();
builder.Services.AddScoped<IInstallmentService, InstallmentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ICashbackService, CashbackService>();
builder.Services.AddScoped<IBillPaymentService, BillPaymentService>();
builder.Services.AddScoped<IInternationalTransferService, InternationalTransferService>();
builder.Services.AddScoped<ISavingsGoalService, SavingsGoalService>();
builder.Services.AddScoped<IQrPaymentService, QrPaymentService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IAutoCreditService, AutoCreditService>();
builder.Services.AddScoped<IFlightBookingService, FlightBookingService>();
builder.Services.AddScoped<IKycService, KycService>();
builder.Services.AddScoped<IBeneficiaryService, BeneficiaryService>();
builder.Services.AddScoped<IRecurringPaymentService, RecurringPaymentService>();
builder.Services.AddScoped<ISupportTicketService, SupportTicketService>();
builder.Services.AddScoped<IFraudDetectionService, FraudDetectionService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IVirtualCardService, VirtualCardService>();
builder.Services.AddScoped<ICreditScoringService, CreditScoringService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient<INbtExchangeRateSource, NbtExchangeRateSource>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SomoniBank API",
        Version = "v1",
        Description = "Цифровой банк Таджикистана"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите токен: Bearer {your token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p =>
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
    await EnsureDevelopmentTestUserAsync(
        dbContext,
        builder.Configuration,
        builder.Environment);
}

app.UseMiddleware<RequestTimeMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static async Task EnsureDevelopmentTestUserAsync(
    AppDbContext dbContext,
    IConfiguration configuration,
    IWebHostEnvironment environment)
{
    if (!environment.IsDevelopment())
    {
        return;
    }

    var phone = configuration["DevelopmentTestUser:Phone"]?.Trim();
    var password = configuration["DevelopmentTestUser:Password"];

    if (string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    var normalizedPhone = NormalizePhone(phone);
    var digits = new string(normalizedPhone.Where(char.IsDigit).ToArray());
    if (string.IsNullOrWhiteSpace(digits))
    {
        return;
    }

    var email = $"{digits}@sbank.local";
    var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Phone == normalizedPhone);

    if (user == null)
    {
        user = new User
        {
            FirstName = configuration["DevelopmentTestUser:FirstName"]?.Trim() ?? "Gumarjon",
            LastName = configuration["DevelopmentTestUser:LastName"]?.Trim() ?? "Test",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Phone = normalizedPhone,
            Address = configuration["DevelopmentTestUser:Address"]?.Trim() ?? "Development profile",
            PassportNumber = configuration["DevelopmentTestUser:PassportNumber"]?.Trim() ?? $"DEV{digits[..Math.Min(digits.Length, 17)]}",
            Role = UserRole.Client,
            IsActive = true
        };

        dbContext.Users.Add(user);
    }
    else
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        user.Email = string.IsNullOrWhiteSpace(user.Email) ? email : user.Email;
        user.IsActive = true;
    }

    await dbContext.SaveChangesAsync();
}

static string NormalizePhone(string phone)
{
    var normalized = phone.Trim()
        .Replace(" ", string.Empty)
        .Replace("-", string.Empty)
        .Replace("(", string.Empty)
        .Replace(")", string.Empty);

    if (normalized.StartsWith("00", StringComparison.Ordinal))
    {
        normalized = "+" + normalized[2..];
    }

    return normalized;
}
