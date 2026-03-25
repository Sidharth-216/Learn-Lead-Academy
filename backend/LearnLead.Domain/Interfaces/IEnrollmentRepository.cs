using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface IEnrollmentRepository
{
    Task<Enrollment?> GetByIdAsync(string id);
    Task<Enrollment?> GetByUserAndCourseAsync(string userId, string courseId);
    Task<IEnumerable<Enrollment>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Enrollment>> GetByCourseIdAsync(string courseId);
    Task<IEnumerable<Enrollment>> GetRecentAsync(int limit);
    Task<long> CountAsync();
    Task<long> CountByUserIdAsync(string userId);
    Task CreateAsync(Enrollment enrollment);
    Task UpdateProgressAsync(string id, int progressPercent, DateTime? completedAt);
    Task DeleteAsync(string id);
}
