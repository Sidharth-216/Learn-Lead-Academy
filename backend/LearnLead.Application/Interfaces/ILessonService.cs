using LearnLead.Application.DTOs.Lessons;

namespace LearnLead.Application.Interfaces;

public interface ILessonService
{
    Task<IEnumerable<LessonDto>> GetByCourseIdAsync(string courseId);
    Task<LessonDto> GetByIdAsync(string id);
    Task<LessonDto> CreateAsync(string courseId, CreateLessonDto dto);
    Task<LessonDto> UpdateAsync(string id, UpdateLessonDto dto);
    Task DeleteAsync(string id);
}