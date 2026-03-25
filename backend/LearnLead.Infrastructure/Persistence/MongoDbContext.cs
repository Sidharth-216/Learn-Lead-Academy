using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace LearnLead.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IConfiguration config)
    {
        var connStr = config["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB:ConnectionString is not configured.");
        var dbName  = config["MongoDB:DatabaseName"]
            ?? throw new InvalidOperationException("MongoDB:DatabaseName is not configured.");

        var settings            = MongoClientSettings.FromConnectionString(connStr);
        settings.ServerApi      = new ServerApi(ServerApiVersion.V1);
        settings.ConnectTimeout = TimeSpan.FromSeconds(10);

        var client = new MongoClient(settings);
        _db        = client.GetDatabase(dbName);
    }

    public IMongoCollection<T> GetCollection<T>(string name)
        => _db.GetCollection<T>(name);
}
