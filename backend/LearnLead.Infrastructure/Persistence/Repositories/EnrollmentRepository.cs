using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class EnrollmentRepository : IEnrollmentRepository
{
    private readonly IMongoCollection<Enrollment> _col;

    public EnrollmentRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<Enrollment>("enrollments");

        // Compound unique index: one enrollment per user per course
        var uniqueIndex = new CreateIndexModel<Enrollment>(
            Builders<Enrollment>.IndexKeys
                .Ascending(e => e.UserId)
                .Ascending(e => e.CourseId),
            new CreateIndexOptions { Unique = true, Background = true });

        var userIndex = new CreateIndexModel<Enrollment>(
            Builders<Enrollment>.IndexKeys.Ascending(e => e.UserId),
            new CreateIndexOptions { Background = true });

        var courseIndex = new CreateIndexModel<Enrollment>(
            Builders<Enrollment>.IndexKeys.Ascending(e => e.CourseId),
            new CreateIndexOptions { Background = true });

        _col.Indexes.CreateMany(new[] { uniqueIndex, userIndex, courseIndex });
    }

    public async Task<Enrollment?> GetByIdAsync(string id)
        => await _col.Find(e => e.Id == id).FirstOrDefaultAsync();

    public async Task<Enrollment?> GetByUserAndCourseAsync(string userId, string courseId)
        => await _col.Find(e => e.UserId == userId && e.CourseId == courseId).FirstOrDefaultAsync();

    public async Task<IEnumerable<Enrollment>> GetByUserIdAsync(string userId)
        => await _col.Find(e => e.UserId == userId)
            .SortByDescending(e => e.EnrolledAt)
            .ToListAsync();

    public async Task<IEnumerable<Enrollment>> GetByCourseIdAsync(string courseId)
        => await _col.Find(e => e.CourseId == courseId)
            .SortByDescending(e => e.EnrolledAt)
            .ToListAsync();

    public async Task<IEnumerable<Enrollment>> GetRecentAsync(int limit)
        => await _col.Find(Builders<Enrollment>.Filter.Empty)
            .SortByDescending(e => e.EnrolledAt)
            .Limit(limit)
            .ToListAsync();

    public async Task<long> CountAsync()
        => await _col.CountDocumentsAsync(Builders<Enrollment>.Filter.Empty);

    public async Task<long> CountByUserIdAsync(string userId)
        => await _col.CountDocumentsAsync(e => e.UserId == userId);

    public async Task CreateAsync(Enrollment enrollment)
        => await _col.InsertOneAsync(enrollment);

    public async Task UpdateProgressAsync(string id, int progressPercent, DateTime? completedAt)
    {
        var update = Builders<Enrollment>.Update
            .Set(e => e.ProgressPercent, progressPercent)
            .Set(e => e.CompletedAt,     completedAt);
        await _col.UpdateOneAsync(e => e.Id == id, update);
    }

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(e => e.Id == id);
}
