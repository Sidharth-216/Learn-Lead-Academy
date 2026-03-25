using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly IMongoCollection<Course> _col;

    public CourseRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<Course>("courses");

        // Indexes
        _col.Indexes.CreateMany(new[]
        {
            new CreateIndexModel<Course>(
                Builders<Course>.IndexKeys.Ascending(c => c.Category),
                new CreateIndexOptions { Background = true }),
            new CreateIndexModel<Course>(
                Builders<Course>.IndexKeys.Ascending(c => c.IsPublished),
                new CreateIndexOptions { Background = true }),
            new CreateIndexModel<Course>(
                Builders<Course>.IndexKeys.Text(c => c.Title).Text(c => c.Description),
                new CreateIndexOptions { Background = true })
        });
    }

    public async Task<Course?> GetByIdAsync(string id)
        => await _col.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<(IEnumerable<Course> Courses, long Total)> GetAllAsync(
        int page, int pageSize,
        string? category     = null,
        string? search       = null,
        bool   publishedOnly = true)
    {
        var filters = new List<FilterDefinition<Course>>();

        if (publishedOnly)
            filters.Add(Builders<Course>.Filter.Eq(c => c.IsPublished, true));

        if (!string.IsNullOrWhiteSpace(category))
            filters.Add(Builders<Course>.Filter.Regex(c => c.Category,
                new MongoDB.Bson.BsonRegularExpression(category, "i")));

        if (!string.IsNullOrWhiteSpace(search))
            filters.Add(Builders<Course>.Filter.Or(
                Builders<Course>.Filter.Regex(c => c.Title,
                    new MongoDB.Bson.BsonRegularExpression(search, "i")),
                Builders<Course>.Filter.Regex(c => c.Instructor,
                    new MongoDB.Bson.BsonRegularExpression(search, "i"))));

        var filter = filters.Count > 0
            ? Builders<Course>.Filter.And(filters)
            : Builders<Course>.Filter.Empty;

        var total   = await _col.CountDocumentsAsync(filter);
        var courses = await _col.Find(filter)
            .SortByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (courses, total);
    }

    public async Task<IEnumerable<string>> GetDistinctCategoriesAsync()
    {
        var categories = await _col.DistinctAsync<string>("category",
            Builders<Course>.Filter.Eq(c => c.IsPublished, true));
        return await categories.ToListAsync();
    }

    public async Task<long> CountAsync()
        => await _col.CountDocumentsAsync(Builders<Course>.Filter.Empty);

    public async Task CreateAsync(Course course)
        => await _col.InsertOneAsync(course);

    public async Task UpdateAsync(string id, Course course)
        => await _col.ReplaceOneAsync(c => c.Id == id, course);

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(c => c.Id == id);

    public async Task IncrementStudentCountAsync(string courseId)
    {
        var update = Builders<Course>.Update.Inc(c => c.StudentCount, 1);
        await _col.UpdateOneAsync(c => c.Id == courseId, update);
    }
}
