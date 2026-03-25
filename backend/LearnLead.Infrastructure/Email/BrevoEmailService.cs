using LearnLead.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace LearnLead.Infrastructure.Email;

/// <summary>
/// Sends transactional emails via Brevo (formerly Sendinblue) REST API v3.
/// Uses raw HttpClient to avoid heavy SDK dependency.
/// </summary>
public class BrevoEmailService : IEmailService
{
    private readonly HttpClient             _http;
    private readonly string                 _apiKey;
    private readonly string                 _fromEmail;
    private readonly string                 _fromName;
    private readonly ILogger<BrevoEmailService> _logger;

    public BrevoEmailService(IConfiguration config, ILogger<BrevoEmailService> logger)
    {
        _logger    = logger;
        _apiKey    = config["Brevo:ApiKey"]    ?? throw new InvalidOperationException("Brevo:ApiKey not configured.");
        _fromEmail = config["Brevo:FromEmail"] ?? "no-reply@gptechacademy.com";
        _fromName  = config["Brevo:FromName"]  ?? "GP Tech Academy";

        _http = new HttpClient { BaseAddress = new Uri("https://api.brevo.com/v3/") };
        _http.DefaultRequestHeaders.Add("api-key", _apiKey);
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string name)
    {
        var subject = "Welcome to GP Tech Academy!";
        var html    = $@"
            <div style='font-family:sans-serif;max-width:600px;margin:auto'>
              <h2 style='color:#1a1a2e'>Welcome, {name}! 🎓</h2>
              <p>You have successfully registered at <strong>GP Tech Academy</strong>.</p>
              <p>Explore our courses and start learning today.</p>
              <a href='http://localhost:5173/courses'
                 style='background:#6c63ff;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>
                Browse Courses
              </a>
              <p style='color:#888;font-size:12px;margin-top:32px'>GP Tech Academy — Learn Today, Lead Tomorrow</p>
            </div>";

        await SendAsync(toEmail, name, subject, html);
    }

    public async Task SendEnrollmentConfirmationAsync(string toEmail, string name, string courseName)
    {
        var subject = $"You're enrolled in {courseName}!";
        var html    = $@"
            <div style='font-family:sans-serif;max-width:600px;margin:auto'>
              <h2 style='color:#1a1a2e'>Enrollment Confirmed! 🎉</h2>
              <p>Hi <strong>{name}</strong>,</p>
              <p>You have successfully enrolled in <strong>{courseName}</strong>.</p>
              <p>Head to your dashboard to start learning.</p>
              <a href='http://localhost:5173/dashboard'
                 style='background:#6c63ff;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>
                Go to Dashboard
              </a>
            </div>";

        await SendAsync(toEmail, name, subject, html);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string name, string resetLink)
    {
        var subject = "Reset your GP Tech Academy password";
        var html    = $@"
            <div style='font-family:sans-serif;max-width:600px;margin:auto'>
              <h2 style='color:#1a1a2e'>Password Reset Request</h2>
              <p>Hi <strong>{name}</strong>,</p>
              <p>Click below to reset your password. This link expires in 1 hour.</p>
              <a href='{resetLink}'
                 style='background:#e74c3c;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>
                Reset Password
              </a>
              <p style='color:#888;font-size:12px;margin-top:32px'>
                If you did not request a password reset, ignore this email.
              </p>
            </div>";

        await SendAsync(toEmail, name, subject, html);
    }

    // ── Private ────────────────────────────────────────────────────────────
    private async Task SendAsync(string toEmail, string toName, string subject, string htmlContent)
    {
        var payload = new
        {
            sender    = new { email = _fromEmail, name = _fromName },
            to        = new[] { new { email = toEmail, name = toName } },
            subject,
            htmlContent
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.PostAsync("smtp/email", content);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Brevo email failed [{Status}]: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            // Log but never let email failure crash the request pipeline
            _logger.LogError(ex, "Brevo email exception for {Email}", toEmail);
        }
    }
}
