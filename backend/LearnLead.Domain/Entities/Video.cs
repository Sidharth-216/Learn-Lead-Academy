using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LearnLead.Domain.Entities;

public class Video
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("fileName")]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Relative or cloud storage path/URL.
    /// Never expose internal paths directly in public API responses.
    /// </summary>
    [BsonElement("storagePath")]
    public string StoragePath { get; set; } = string.Empty;

    /// <summary>Public-facing CDN or signed URL (populated at read time).</summary>
    [BsonElement("publicUrl")]
    public string? PublicUrl { get; set; }

    [BsonElement("courseId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CourseId { get; set; } = string.Empty;

    [BsonElement("lessonId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public string? LessonId { get; set; }

    [BsonElement("courseName")]
    public string CourseName { get; set; } = string.Empty;

    /// <summary>File size in bytes.</summary>
    [BsonElement("sizeBytes")]
    public long SizeBytes { get; set; }

    [BsonElement("mimeType")]
    public string MimeType { get; set; } = "video/mp4";

    [BsonElement("uploadedAt")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("uploadedByAdminId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UploadedByAdminId { get; set; } = string.Empty;
}
