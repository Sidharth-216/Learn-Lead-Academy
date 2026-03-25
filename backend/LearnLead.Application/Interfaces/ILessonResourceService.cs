using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Resources;

namespace LearnLead.Application.Interfaces;

public interface ILessonResourceService
{
    Task<PagedResultDto<LessonResourceDto>> GetAllAsync(int page, int pageSize, string? courseId = null);
    Task<IEnumerable<LessonResourceDto>> GetByCourseIdAsync(string courseId);
    Task<LessonResourceDto> GetByIdAsync(string id);
    Task<LessonResourceDto> CreateAsync(CreateLessonResourceDto dto, string adminId);
    Task DeleteAsync(string id);
}
