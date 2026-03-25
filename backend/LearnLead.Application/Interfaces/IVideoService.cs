using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Videos;

namespace LearnLead.Application.Interfaces;

public interface IVideoService
{
    Task<PagedResultDto<VideoDto>> GetAllAsync(int page, int pageSize, string? courseId = null);
    Task<VideoDto> GetByIdAsync(string id);
    Task<VideoDto> CreateAsync(CreateVideoDto dto, string adminId);
    Task DeleteAsync(string id);
}
