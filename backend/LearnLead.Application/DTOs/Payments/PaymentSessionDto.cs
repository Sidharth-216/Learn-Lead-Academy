namespace LearnLead.Application.DTOs.Payments;

public class PaymentSessionDto
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string ReferenceCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string? QrPayload { get; set; }
    public string? QrImageBase64 { get; set; }
    public string? GatewayCheckoutUrl { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? SubmittedReference { get; set; }
    public string? AdminNote { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
}

public class CreatePaymentSessionRequest
{
    public string? PreferredChannel { get; set; }
}

public class SubmitPaymentRequest
{
    public string Channel { get; set; } = "QrUpi";
    public string? TransactionReference { get; set; }
}

public class AdminReviewPaymentRequest
{
    public bool Approve { get; set; }
    public string? Note { get; set; }
}

public class PaymentWebhookRequest
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? GatewayPaymentId { get; set; }
}
