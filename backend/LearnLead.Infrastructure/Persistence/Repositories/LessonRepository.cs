using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Persistence.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly IMongoCollection<Lesson> _col;

    public LessonRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<Lesson>("lessons");

        // Index for fast course-based lookups + ordered results
        var courseIdx = new CreateIndexModel<Lesson>(
            Builders<Lesson>.IndexKeys
                .Ascending(l => l.CourseId)
                .Ascending(l => l.Order),
            new CreateIndexOptions { Name = "idx_lessons_courseId_order" });

        _col.Indexes.CreateOne(courseIdx);
    }

    public async Task<Lesson?> GetByIdAsync(string id)
        => await _col.Find(l => l.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<Lesson>> GetByCourseIdAsync(string courseId)
        => await _col.Find(l => l.CourseId == courseId)
                     .SortBy(l => l.Order)
                     .ToListAsync();

    public async Task CreateAsync(Lesson lesson)
        => await _col.InsertOneAsync(lesson);

    public async Task UpdateAsync(string id, Lesson lesson)
        => await _col.ReplaceOneAsync(l => l.Id == id, lesson);

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(l => l.Id == id);

    public async Task DeleteByCourseIdAsync(string courseId)
        => await _col.DeleteManyAsync(l => l.CourseId == courseId);
}