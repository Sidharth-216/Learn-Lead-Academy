using Microsoft.AspNetCore.Http;

namespace LearnLead.API.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevent MIME-type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // Prevent clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Enable XSS filter in older browsers
        headers["X-XSS-Protection"] = "1; mode=block";

        // Control referrer info sent with requests
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Disable unnecessary browser features
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

        // Strict transport security (HTTPS only — enable in production)
        headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";

        // Remove server identification header
        context.Response.Headers.Remove("Server");
        context.Response.Headers.Remove("X-Powered-By");

        await _next(context);
    }
}
