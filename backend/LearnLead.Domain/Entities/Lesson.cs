using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LearnLead.Domain.Entities;

public class Lesson
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("courseId")]
    public string CourseId { get; set; } = string.Empty;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("duration")]
    public string Duration { get; set; } = string.Empty;

    /// <summary>Zero-based order of the lesson within the course.</summary>
    [BsonElement("order")]
    public int Order { get; set; }

    /// <summary>Free preview lesson — accessible without enrollment.</summary>
    [BsonElement("isFree")]
    public bool IsFree { get; set; } = false;

    [BsonElement("videoId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? VideoId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
