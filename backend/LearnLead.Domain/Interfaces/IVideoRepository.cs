using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface IVideoRepository
{
    Task<Video?> GetByIdAsync(string id);
    Task<(IEnumerable<Video> Videos, long Total)> GetAllAsync(int page, int pageSize, string? courseId = null);
    Task<IEnumerable<Video>> GetByCourseIdAsync(string courseId);
    Task<long> CountAsync();
    Task CreateAsync(Video video);
    Task UpdateAsync(string id, Video video);
    Task DeleteAsync(string id);
}
