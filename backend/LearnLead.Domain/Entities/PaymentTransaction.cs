using LearnLead.Domain.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LearnLead.Domain.Entities;

public class PaymentTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("courseId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CourseId { get; set; } = string.Empty;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = "INR";

    [BsonElement("referenceCode")]
    public string ReferenceCode { get; set; } = string.Empty;

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    [BsonElement("channel")]
    [BsonRepresentation(BsonType.String)]
    public PaymentChannel Channel { get; set; } = PaymentChannel.QrUpi;

    [BsonElement("submittedAt")]
    public DateTime? SubmittedAt { get; set; }

    [BsonElement("submittedReference")]
    public string? SubmittedReference { get; set; }

    [BsonElement("gatewayPaymentId")]
    public string? GatewayPaymentId { get; set; }

    [BsonElement("gatewayCheckoutUrl")]
    public string? GatewayCheckoutUrl { get; set; }

    [BsonElement("qrPayload")]
    public string? QrPayload { get; set; }

    [BsonElement("qrImageBase64")]
    public string? QrImageBase64 { get; set; }

    [BsonElement("adminNote")]
    public string? AdminNote { get; set; }

    [BsonElement("confirmedByAdminId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ConfirmedByAdminId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("expiresAt")]
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(30);

    [BsonElement("paidAt")]
    public DateTime? PaidAt { get; set; }

    [BsonElement("confirmedAt")]
    public DateTime? ConfirmedAt { get; set; }
}
