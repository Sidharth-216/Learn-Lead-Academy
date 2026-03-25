using System.Text.Json;
using LearnLead.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LearnLead.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        int statusCode;
        string message;

        switch (ex)
        {
            case NotFoundException:
                statusCode = StatusCodes.Status404NotFound;
                message = ex.Message;
                _logger.LogWarning(ex, "Not found: {Message}", ex.Message);
                break;

            case UnauthorizedException:
                statusCode = StatusCodes.Status401Unauthorized;
                message = ex.Message;
                _logger.LogWarning(ex, "Unauthorized: {Message}", ex.Message);
                break;

            case DomainException:
                statusCode = StatusCodes.Status400BadRequest;
                message = ex.Message;
                _logger.LogWarning(ex, "Domain error: {Message}", ex.Message);
                break;

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                // Never expose internal details in production
                message = _env.IsDevelopment()
                    ? ex.Message
                    : "An unexpected error occurred. Please try again later.";
                _logger.LogError(ex, "Unhandled exception at {Path}", context.Request.Path);
                break;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            statusCode,
            error = message,
            path = context.Request.Path.Value,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
