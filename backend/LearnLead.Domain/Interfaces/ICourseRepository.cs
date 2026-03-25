using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface ICourseRepository
{
    Task<Course?> GetByIdAsync(string id);
    Task<(IEnumerable<Course> Courses, long Total)> GetAllAsync(
        int page,
        int pageSize,
        string? category = null,
        string? search = null,
        bool publishedOnly = true);
    Task<IEnumerable<string>> GetDistinctCategoriesAsync();
    Task<long> CountAsync();
    Task CreateAsync(Course course);
    Task UpdateAsync(string id, Course course);
    Task DeleteAsync(string id);
    Task IncrementStudentCountAsync(string courseId);
}
