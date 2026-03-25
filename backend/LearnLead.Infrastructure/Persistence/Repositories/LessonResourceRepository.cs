using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Persistence.Repositories;

public class LessonResourceRepository : ILessonResourceRepository
{
    private readonly IMongoCollection<LessonResource> _col;

    public LessonResourceRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<LessonResource>("lessonResources");

        _col.Indexes.CreateOne(new CreateIndexModel<LessonResource>(
            Builders<LessonResource>.IndexKeys
                .Ascending(x => x.CourseId)
                .Ascending(x => x.LessonOrder)
                .Ascending(x => x.ResourceType),
            new CreateIndexOptions { Name = "idx_resources_course_lesson_type" }));
    }

    public async Task<LessonResource?> GetByIdAsync(string id)
        => await _col.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<(IEnumerable<LessonResource> Items, long Total)> GetAllAsync(int page, int pageSize, string? courseId = null)
    {
        var filter = courseId is null
            ? Builders<LessonResource>.Filter.Empty
            : Builders<LessonResource>.Filter.Eq(x => x.CourseId, courseId);

        var total = await _col.CountDocumentsAsync(filter);
        var items = await _col.Find(filter)
            .SortBy(x => x.CourseName)
            .ThenBy(x => x.LessonOrder)
            .ThenBy(x => x.ResourceType)
            .ThenByDescending(x => x.UploadedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IEnumerable<LessonResource>> GetByCourseIdAsync(string courseId)
        => await _col.Find(x => x.CourseId == courseId)
            .SortBy(x => x.LessonOrder)
            .ThenBy(x => x.ResourceType)
            .ThenByDescending(x => x.UploadedAt)
            .ToListAsync();

    public async Task CreateAsync(LessonResource resource)
        => await _col.InsertOneAsync(resource);

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(x => x.Id == id);

    public async Task DeleteByLessonIdAsync(string lessonId)
        => await _col.DeleteManyAsync(x => x.LessonId == lessonId);
}
