using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class VideoRepository : IVideoRepository
{
    private readonly IMongoCollection<Video> _col;

    public VideoRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<Video>("videos");

        _col.Indexes.CreateOne(new CreateIndexModel<Video>(
            Builders<Video>.IndexKeys.Ascending(v => v.CourseId),
            new CreateIndexOptions { Background = true }));
    }

    public async Task<Video?> GetByIdAsync(string id)
        => await _col.Find(v => v.Id == id).FirstOrDefaultAsync();

    public async Task<(IEnumerable<Video> Videos, long Total)> GetAllAsync(
        int page, int pageSize, string? courseId = null)
    {
        var filter = courseId is not null
            ? Builders<Video>.Filter.Eq(v => v.CourseId, courseId)
            : Builders<Video>.Filter.Empty;

        var total  = await _col.CountDocumentsAsync(filter);
        var videos = await _col.Find(filter)
            .SortByDescending(v => v.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (videos, total);
    }

    public async Task<IEnumerable<Video>> GetByCourseIdAsync(string courseId)
        => await _col.Find(v => v.CourseId == courseId)
            .SortByDescending(v => v.UploadedAt)
            .ToListAsync();

    public async Task<long> CountAsync()
        => await _col.CountDocumentsAsync(Builders<Video>.Filter.Empty);

    public async Task CreateAsync(Video video)
        => await _col.InsertOneAsync(video);

    public async Task UpdateAsync(string id, Video video)
        => await _col.ReplaceOneAsync(v => v.Id == id, video);

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(v => v.Id == id);
}
