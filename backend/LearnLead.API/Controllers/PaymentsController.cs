using System.Security.Claims;
using System.Text;
using System.Text.Json;
using LearnLead.Application.DTOs.Payments;
using LearnLead.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
[EnableRateLimiting("payment")]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
        => _paymentService = paymentService;

    [HttpPost("course/{courseId}/session")]
    [ProducesResponseType(typeof(PaymentSessionDto), 201)]
    public async Task<IActionResult> CreateSession(string courseId, [FromBody] CreatePaymentSessionRequest? request)
    {
        var userId = GetUserId();
        var payment = await _paymentService.CreateSessionAsync(userId, courseId, request?.PreferredChannel);
        return CreatedAtAction(nameof(GetById), new { paymentId = payment.Id }, payment);
    }

    [HttpGet("{paymentId}")]
    [ProducesResponseType(typeof(PaymentSessionDto), 200)]
    public async Task<IActionResult> GetById(string paymentId)
    {
        var userId = GetUserId();
        var payment = await _paymentService.GetByIdForUserAsync(userId, paymentId);
        return Ok(payment);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(IEnumerable<PaymentSessionDto>), 200)]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetUserId();
        var payments = await _paymentService.GetMyPaymentsAsync(userId);
        return Ok(payments);
    }

    [HttpPost("{paymentId}/submit")]
    [ProducesResponseType(typeof(PaymentSessionDto), 200)]
    public async Task<IActionResult> SubmitForReview(string paymentId, [FromBody] SubmitPaymentRequest request)
    {
        var userId = GetUserId();
        var payment = await _paymentService.SubmitForReviewAsync(userId, paymentId, request);
        return Ok(payment);
    }

    [AllowAnonymous]
    [HttpPost("webhook/gateway")]
    public async Task<IActionResult> GatewayWebhook()
    {
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true);
        Request.Body.Position = 0;
        var rawBody = await reader.ReadToEndAsync();
        Request.Body.Position = 0;

        var request = JsonSerializer.Deserialize<PaymentWebhookRequest>(rawBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new InvalidOperationException("Invalid webhook payload.");

        var signature = Request.Headers["X-Gateway-Signature"].ToString();
        await _paymentService.HandleGatewayWebhookAsync(signature, rawBody, request);
        return Ok(new { received = true });
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("User ID not found in token claims.");
}
