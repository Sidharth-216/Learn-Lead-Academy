using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface ILessonRepository
{
    Task<Lesson?> GetByIdAsync(string id);
    Task<IEnumerable<Lesson>> GetByCourseIdAsync(string courseId);
    Task CreateAsync(Lesson lesson);
    Task UpdateAsync(string id, Lesson lesson);
    Task DeleteAsync(string id);
    Task DeleteByCourseIdAsync(string courseId);
}