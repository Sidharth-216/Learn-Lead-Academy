using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Enrollments;
using LearnLead.Application.DTOs.Users;

namespace LearnLead.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> GetByIdAsync(string id);
    Task<PagedResultDto<UserDto>> GetAllAsync(int page, int pageSize, string? search = null);
    Task<UserDto> UpdateStatusAsync(string id, string status);
    Task<IEnumerable<EnrollmentDto>> GetMyEnrollmentsAsync(string userId);
    Task<EnrollmentDto> EnrollAsync(string userId, string courseId);
    Task<EnrollmentDto> UpdateProgressAsync(string userId, string courseId, int progressPercent);
}
