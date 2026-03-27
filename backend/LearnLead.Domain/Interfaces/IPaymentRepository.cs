using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<PaymentTransaction?> GetByIdAsync(string id);
    Task<PaymentTransaction?> GetByReferenceCodeAsync(string referenceCode);
    Task<PaymentTransaction?> GetActiveByUserAndCourseAsync(string userId, string courseId);
    Task<IEnumerable<PaymentTransaction>> GetByUserIdAsync(string userId);
    Task<(IEnumerable<PaymentTransaction> Payments, long Total)> GetPagedAsync(
        int page,
        int pageSize,
        string? status = null,
        string? search = null);
    Task CreateAsync(PaymentTransaction payment);
    Task UpdateAsync(string id, PaymentTransaction payment);
}
