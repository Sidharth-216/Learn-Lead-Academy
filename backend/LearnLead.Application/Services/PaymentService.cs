using System.Security.Cryptography;
using System.Text;
using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Payments;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Enums;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using QRCoder;

namespace LearnLead.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IUserService _userService;
    private readonly IConfiguration _config;

    public PaymentService(
        IPaymentRepository paymentRepo,
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        IUserService userService,
        IConfiguration config)
    {
        _paymentRepo = paymentRepo;
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _userService = userService;
        _config = config;
    }

    public async Task<PaymentSessionDto> CreateSessionAsync(string userId, string courseId, string? preferredChannel = null)
    {
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new NotFoundException("Course", courseId);

        if (!course.IsPublished)
            throw new DomainException("This course is not available for enrollment.");

        var existingEnrollment = await _enrollmentRepo.GetByUserAndCourseAsync(userId, courseId);
        if (existingEnrollment is not null)
            throw new DomainException("You are already enrolled in this course.");

        var active = await _paymentRepo.GetActiveByUserAndCourseAsync(userId, courseId);
        if (active is not null)
            return ToDto(active, course.Title);

        var channel = ParseChannel(preferredChannel);
        var payment = new PaymentTransaction
        {
            UserId = userId,
            CourseId = courseId,
            Amount = course.Price,
            Currency = "INR",
            ReferenceCode = BuildReferenceCode(),
            Channel = channel,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };

        if (payment.Amount <= 0)
        {
            payment.Status = PaymentStatus.Paid;
            payment.PaidAt = DateTime.UtcNow;
            payment.ConfirmedAt = DateTime.UtcNow;
            await _paymentRepo.CreateAsync(payment);
            await _userService.EnrollAsync(userId, courseId);
            return ToDto(payment, course.Title);
        }

        payment.QrPayload = BuildQrPayload(payment, course.Title);
        payment.QrImageBase64 = string.IsNullOrWhiteSpace(payment.QrPayload)
            ? null
            : BuildQrBase64(payment.QrPayload);

        var gatewayBase = _config["Payments:Gateway:CheckoutBaseUrl"];
        if (!string.IsNullOrWhiteSpace(gatewayBase))
        {
            payment.GatewayCheckoutUrl = $"{gatewayBase}?reference={Uri.EscapeDataString(payment.ReferenceCode)}&amount={payment.Amount:F2}&currency={payment.Currency}";
        }

        await _paymentRepo.CreateAsync(payment);
        return ToDto(payment, course.Title);
    }

    public async Task<PaymentSessionDto> GetByIdForUserAsync(string userId, string paymentId)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId)
            ?? throw new NotFoundException("Payment", paymentId);

        if (payment.UserId != userId)
            throw new UnauthorizedException("You are not allowed to access this payment.");

        if (payment.Status == PaymentStatus.Pending && payment.ExpiresAt <= DateTime.UtcNow)
        {
            payment.Status = PaymentStatus.Expired;
            await _paymentRepo.UpdateAsync(payment.Id, payment);
        }

        var course = await _courseRepo.GetByIdAsync(payment.CourseId);
        return ToDto(payment, course?.Title ?? "Course");
    }

    public async Task<IEnumerable<PaymentSessionDto>> GetMyPaymentsAsync(string userId)
    {
        var items = await _paymentRepo.GetByUserIdAsync(userId);
        var result = new List<PaymentSessionDto>();

        foreach (var payment in items)
        {
            var course = await _courseRepo.GetByIdAsync(payment.CourseId);
            result.Add(ToDto(payment, course?.Title ?? "Course"));
        }

        return result;
    }

    public async Task<PaymentSessionDto> SubmitForReviewAsync(string userId, string paymentId, SubmitPaymentRequest request)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId)
            ?? throw new NotFoundException("Payment", paymentId);

        if (payment.UserId != userId)
            throw new UnauthorizedException("You are not allowed to submit this payment.");

        if (payment.Status == PaymentStatus.Paid)
            throw new DomainException("This payment is already approved.");

        if (payment.ExpiresAt <= DateTime.UtcNow)
        {
            payment.Status = PaymentStatus.Expired;
            await _paymentRepo.UpdateAsync(payment.Id, payment);
            throw new DomainException("This payment session has expired. Please create a new payment.");
        }

        if (string.IsNullOrWhiteSpace(request.TransactionReference) || request.TransactionReference.Trim().Length < 6)
            throw new DomainException("Please provide a valid transaction reference.");

        payment.Channel = ParseChannel(request.Channel);
        payment.SubmittedReference = request.TransactionReference.Trim();
        payment.SubmittedAt = DateTime.UtcNow;
        payment.Status = PaymentStatus.UnderReview;

        await _paymentRepo.UpdateAsync(payment.Id, payment);

        var course = await _courseRepo.GetByIdAsync(payment.CourseId);
        return ToDto(payment, course?.Title ?? "Course");
    }

    public async Task<PagedResultDto<PaymentSessionDto>> GetAdminPaymentsAsync(int page, int pageSize, string? status = null, string? search = null)
    {
        (page, pageSize) = PagingGuard.Normalize(page, pageSize);
        var (items, total) = await _paymentRepo.GetPagedAsync(page, pageSize, status, search);

        var dtos = new List<PaymentSessionDto>();
        foreach (var payment in items)
        {
            var course = await _courseRepo.GetByIdAsync(payment.CourseId);
            dtos.Add(ToDto(payment, course?.Title ?? "Course"));
        }

        return new PagedResultDto<PaymentSessionDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaymentSessionDto> ReviewPaymentAsync(string adminId, string paymentId, AdminReviewPaymentRequest request)
    {
        var payment = await _paymentRepo.GetByIdAsync(paymentId)
            ?? throw new NotFoundException("Payment", paymentId);

        if (payment.Status == PaymentStatus.Paid)
        {
            var alreadyPaidCourse = await _courseRepo.GetByIdAsync(payment.CourseId);
            return ToDto(payment, alreadyPaidCourse?.Title ?? "Course");
        }

        payment.AdminNote = request.Note?.Trim();
        payment.ConfirmedAt = DateTime.UtcNow;
        payment.ConfirmedByAdminId = adminId;

        if (request.Approve)
        {
            payment.Status = PaymentStatus.Paid;
            payment.PaidAt ??= DateTime.UtcNow;

            var enrolled = await _enrollmentRepo.GetByUserAndCourseAsync(payment.UserId, payment.CourseId);
            if (enrolled is null)
            {
                await _userService.EnrollAsync(payment.UserId, payment.CourseId);
            }
        }
        else
        {
            payment.Status = PaymentStatus.Rejected;
        }

        await _paymentRepo.UpdateAsync(payment.Id, payment);
        var course = await _courseRepo.GetByIdAsync(payment.CourseId);
        return ToDto(payment, course?.Title ?? "Course");
    }

    public async Task HandleGatewayWebhookAsync(string signatureHeader, string rawBody, PaymentWebhookRequest request)
    {
        var secret = _config["Payments:Gateway:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(secret))
            throw new DomainException("Gateway webhook secret is not configured.");

        if (!IsValidSignature(secret, signatureHeader, rawBody))
            throw new UnauthorizedException("Invalid webhook signature.");

        var payment = await _paymentRepo.GetByReferenceCodeAsync(request.ReferenceCode)
            ?? throw new NotFoundException("Payment reference", request.ReferenceCode);

        var success = string.Equals(request.Status, "success", StringComparison.OrdinalIgnoreCase)
            || string.Equals(request.Status, "paid", StringComparison.OrdinalIgnoreCase)
            || string.Equals(request.Status, "captured", StringComparison.OrdinalIgnoreCase);

        payment.GatewayPaymentId = request.GatewayPaymentId?.Trim();
        payment.Channel = PaymentChannel.OnlineBanking;

        if (success)
        {
            payment.Status = PaymentStatus.Paid;
            payment.PaidAt = DateTime.UtcNow;
            payment.ConfirmedAt = DateTime.UtcNow;
            payment.AdminNote = "Auto-confirmed via gateway webhook.";

            var enrolled = await _enrollmentRepo.GetByUserAndCourseAsync(payment.UserId, payment.CourseId);
            if (enrolled is null)
            {
                await _userService.EnrollAsync(payment.UserId, payment.CourseId);
            }
        }
        else
        {
            payment.Status = PaymentStatus.Rejected;
            payment.AdminNote = "Gateway reported failed payment.";
        }

        await _paymentRepo.UpdateAsync(payment.Id, payment);
    }

    private static string BuildReferenceCode()
    {
        var rng = RandomNumberGenerator.GetInt32(100000, 999999);
        return $"PAY-{DateTime.UtcNow:yyyyMMdd}-{rng}";
    }

    private string BuildQrPayload(PaymentTransaction payment, string courseTitle)
    {
        var upiId = _config["Payments:Qr:UpiId"];
        if (string.IsNullOrWhiteSpace(upiId)) return string.Empty;

        var name = _config["Payments:Qr:PayeeName"] ?? "LearnLead Academy";
        var note = $"{courseTitle} | {payment.ReferenceCode}";

        return $"upi://pay?pa={Uri.EscapeDataString(upiId)}&pn={Uri.EscapeDataString(name)}&am={payment.Amount:F2}&cu=INR&tn={Uri.EscapeDataString(note)}";
    }

    private static string BuildQrBase64(string payload)
    {
        using var dataGenerator = new QRCodeGenerator();
        using var qrData = dataGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        var pngBytes = new PngByteQRCode(qrData).GetGraphic(20);
        return Convert.ToBase64String(pngBytes);
    }

    private static PaymentChannel ParseChannel(string? channel)
    {
        if (string.IsNullOrWhiteSpace(channel)) return PaymentChannel.QrUpi;
        if (Enum.TryParse<PaymentChannel>(channel, ignoreCase: true, out var parsed)) return parsed;
        return PaymentChannel.QrUpi;
    }

    private static bool IsValidSignature(string secret, string signatureHeader, string rawBody)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader)) return false;

        var header = signatureHeader.Trim();
        if (header.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
        {
            header = header[7..];
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
        var expected = Convert.ToHexString(hash).ToLowerInvariant();
        var provided = header.ToLowerInvariant();

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(provided));
    }

    private static PaymentSessionDto ToDto(PaymentTransaction payment, string courseTitle) => new()
    {
        Id = payment.Id,
        CourseId = payment.CourseId,
        CourseTitle = courseTitle,
        Amount = payment.Amount,
        Currency = payment.Currency,
        ReferenceCode = payment.ReferenceCode,
        Status = payment.Status.ToString(),
        Channel = payment.Channel.ToString(),
        QrPayload = payment.QrPayload,
        QrImageBase64 = payment.QrImageBase64,
        GatewayCheckoutUrl = payment.GatewayCheckoutUrl,
        ExpiresAt = payment.ExpiresAt,
        CreatedAt = payment.CreatedAt,
        SubmittedReference = payment.SubmittedReference,
        AdminNote = payment.AdminNote,
        PaidAt = payment.PaidAt,
        ConfirmedAt = payment.ConfirmedAt
    };
}
