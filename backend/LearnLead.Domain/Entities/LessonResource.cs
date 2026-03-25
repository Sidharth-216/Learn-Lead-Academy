using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LearnLead.Domain.Entities;

public class LessonResource
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("resourceType")]
    public string ResourceType { get; set; } = string.Empty;

    [BsonElement("storagePath")]
    public string StoragePath { get; set; } = string.Empty;

    [BsonElement("isExternalLink")]
    public bool IsExternalLink { get; set; }

    [BsonElement("courseId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CourseId { get; set; } = string.Empty;

    [BsonElement("courseName")]
    public string CourseName { get; set; } = string.Empty;

    [BsonElement("lessonId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string LessonId { get; set; } = string.Empty;

    [BsonElement("lessonTitle")]
    public string LessonTitle { get; set; } = string.Empty;

    [BsonElement("lessonOrder")]
    public int LessonOrder { get; set; }

    [BsonElement("lessonIsFree")]
    public bool LessonIsFree { get; set; }

    [BsonElement("sizeBytes")]
    public long SizeBytes { get; set; }

    [BsonElement("mimeType")]
    public string MimeType { get; set; } = "application/octet-stream";

    [BsonElement("uploadedAt")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("uploadedByAdminId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UploadedByAdminId { get; set; } = string.Empty;
}
