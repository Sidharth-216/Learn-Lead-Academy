using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LearnLead.Domain.Entities;

public class Course
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("instructor")]
    public string Instructor { get; set; } = string.Empty;

    [BsonElement("duration")]
    public string Duration { get; set; } = string.Empty;

    [BsonElement("lessonCount")]
    public int LessonCount { get; set; }

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("rating")]
    public double Rating { get; set; }

    [BsonElement("studentCount")]
    public int StudentCount { get; set; }

    [BsonElement("thumbnailUrl")]
    public string? ThumbnailUrl { get; set; }

    [BsonElement("isPublished")]
    public bool IsPublished { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
