using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Persistence;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly IMongoCollection<AcademySettings> _col;

    public SettingsRepository(MongoDbContext ctx)
        => _col = ctx.GetCollection<AcademySettings>("academy_settings");

    public async Task<AcademySettings> GetAsync()
    {
        var settings = await _col.Find(_ => true).FirstOrDefaultAsync();
        if (settings is null)
        {
            // Seed defaults on first access
            settings = new AcademySettings();
            await _col.InsertOneAsync(settings);
        }
        return settings;
    }

    public async Task UpsertAsync(AcademySettings settings)
    {
        var filter  = Builders<AcademySettings>.Filter.Empty;
        var options = new ReplaceOptions { IsUpsert = true };
        await _col.ReplaceOneAsync(filter, settings, options);
    }
}
