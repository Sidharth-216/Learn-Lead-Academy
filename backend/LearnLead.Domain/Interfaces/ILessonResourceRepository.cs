using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface ILessonResourceRepository
{
    Task<LessonResource?> GetByIdAsync(string id);
    Task<(IEnumerable<LessonResource> Items, long Total)> GetAllAsync(int page, int pageSize, string? courseId = null);
    Task<IEnumerable<LessonResource>> GetByCourseIdAsync(string courseId);
    Task CreateAsync(LessonResource resource);
    Task DeleteAsync(string id);
    Task DeleteByLessonIdAsync(string lessonId);
}
