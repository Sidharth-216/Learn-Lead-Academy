using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Payments;

namespace LearnLead.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentSessionDto> CreateSessionAsync(string userId, string courseId, string? preferredChannel = null);
    Task<PaymentSessionDto> GetByIdForUserAsync(string userId, string paymentId);
    Task<IEnumerable<PaymentSessionDto>> GetMyPaymentsAsync(string userId);
    Task<PaymentSessionDto> SubmitForReviewAsync(string userId, string paymentId, SubmitPaymentRequest request);
    Task<PagedResultDto<PaymentSessionDto>> GetAdminPaymentsAsync(int page, int pageSize, string? status = null, string? search = null);
    Task<PaymentSessionDto> ReviewPaymentAsync(string adminId, string paymentId, AdminReviewPaymentRequest request);
    Task HandleGatewayWebhookAsync(string signatureHeader, string rawBody, PaymentWebhookRequest request);
}
