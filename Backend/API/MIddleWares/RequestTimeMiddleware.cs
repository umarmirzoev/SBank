namespace SomoniBank.API.MiddleWares;

public class RequestTimeMiddleware(RequestDelegate next, ILogger<RequestTimeMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<RequestTimeMiddleware> _logger = logger;

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogInformation("Incoming request: {Method} {Path}",
            context.Request.Method, context.Request.Path);
        var start = DateTime.UtcNow;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "The request was not successful");
            throw;
        }
        finally
        {
            var end = DateTime.UtcNow;
            _logger.LogInformation("Request finished in {Ms} ms",
                (end - start).TotalMilliseconds);
        }
    }
}
