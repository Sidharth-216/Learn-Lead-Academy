using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Courses;

namespace LearnLead.Application.Interfaces;

public interface ICourseService
{
    Task<PagedResultDto<CourseDto>> GetAllPublishedAsync(int page, int pageSize, string? category = null, string? search = null);
    Task<PagedResultDto<CourseDto>> GetAllAdminAsync(int page, int pageSize, string? search = null);
    Task<CourseDto> GetByIdAsync(string id);
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task<CourseDto> CreateAsync(CreateCourseDto dto);
    Task<CourseDto> UpdateAsync(string id, UpdateCourseDto dto);
    Task DeleteAsync(string id);
}
