using LearnLead.Domain.Entities;
using LearnLead.Domain.Enums;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly IMongoCollection<PaymentTransaction> _col;

    public PaymentRepository(MongoDbContext ctx)
    {
        _col = ctx.GetCollection<PaymentTransaction>("payments");

        var referenceIndex = new CreateIndexModel<PaymentTransaction>(
            Builders<PaymentTransaction>.IndexKeys.Ascending(x => x.ReferenceCode),
            new CreateIndexOptions { Unique = true, Background = true });

        var userCourseIndex = new CreateIndexModel<PaymentTransaction>(
            Builders<PaymentTransaction>.IndexKeys
                .Ascending(x => x.UserId)
                .Ascending(x => x.CourseId)
                .Descending(x => x.CreatedAt),
            new CreateIndexOptions { Background = true });

        var statusIndex = new CreateIndexModel<PaymentTransaction>(
            Builders<PaymentTransaction>.IndexKeys
                .Ascending(x => x.Status)
                .Descending(x => x.CreatedAt),
            new CreateIndexOptions { Background = true });

        _col.Indexes.CreateMany(new[] { referenceIndex, userCourseIndex, statusIndex });
    }

    public async Task<PaymentTransaction?> GetByIdAsync(string id)
        => await _col.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<PaymentTransaction?> GetByReferenceCodeAsync(string referenceCode)
        => await _col.Find(x => x.ReferenceCode == referenceCode).FirstOrDefaultAsync();

    public async Task<PaymentTransaction?> GetActiveByUserAndCourseAsync(string userId, string courseId)
    {
        var now = DateTime.UtcNow;
        return await _col.Find(x =>
                x.UserId == userId
                && x.CourseId == courseId
                && x.Status != PaymentStatus.Paid
                && x.Status != PaymentStatus.Rejected
                && x.ExpiresAt > now)
            .SortByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<PaymentTransaction>> GetByUserIdAsync(string userId)
        => await _col.Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();

    public async Task<(IEnumerable<PaymentTransaction> Payments, long Total)> GetPagedAsync(
        int page,
        int pageSize,
        string? status = null,
        string? search = null)
    {
        var filter = Builders<PaymentTransaction>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PaymentStatus>(status, true, out var parsed))
        {
            filter &= Builders<PaymentTransaction>.Filter.Eq(x => x.Status, parsed);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(search.Trim(), "i");
            var searchFilter = Builders<PaymentTransaction>.Filter.Or(
                Builders<PaymentTransaction>.Filter.Regex(x => x.ReferenceCode, regex),
                Builders<PaymentTransaction>.Filter.Regex(x => x.SubmittedReference, regex));
            filter &= searchFilter;
        }

        var total = await _col.CountDocumentsAsync(filter);
        var items = await _col.Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task CreateAsync(PaymentTransaction payment)
        => await _col.InsertOneAsync(payment);

    public async Task UpdateAsync(string id, PaymentTransaction payment)
        => await _col.ReplaceOneAsync(x => x.Id == id, payment);
}
