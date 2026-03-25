using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _col;

    public UserRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<User>("users");

        // Unique index on email — enforced at DB level
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true, Background = true });

        // Index for refresh-token lookup
        var tokenIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.RefreshToken),
            new CreateIndexOptions { Sparse = true, Background = true });

        _col.Indexes.CreateMany(new[] { emailIndex, tokenIndex });
    }

    public async Task<User?> GetByIdAsync(string id)
        => await _col.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email)
        => await _col.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        => await _col.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync();

    public async Task<(IEnumerable<User> Users, long Total)> GetAllAsync(
        int page, int pageSize, string? search = null)
    {
        var filter = search is null
            ? Builders<User>.Filter.Empty
            : Builders<User>.Filter.Or(
                Builders<User>.Filter.Regex(u => u.Name,  new MongoDB.Bson.BsonRegularExpression(search, "i")),
                Builders<User>.Filter.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(search, "i")));

        var total = await _col.CountDocumentsAsync(filter);
        var users = await _col.Find(filter)
            .SortByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (users, total);
    }

    public async Task<long> CountAsync()
        => await _col.CountDocumentsAsync(Builders<User>.Filter.Empty);

    public async Task CreateAsync(User user)
        => await _col.InsertOneAsync(user);

    public async Task UpdateAsync(string id, User user)
        => await _col.ReplaceOneAsync(u => u.Id == id, user, new ReplaceOptions { IsUpsert = false });

    public async Task DeleteAsync(string id)
        => await _col.DeleteOneAsync(u => u.Id == id);
}
