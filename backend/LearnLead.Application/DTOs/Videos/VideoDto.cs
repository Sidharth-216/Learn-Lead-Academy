namespace LearnLead.Application.DTOs.Videos;

public class VideoDto
{
    public string Id { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string? LessonId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string FormattedSize { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public class CreateVideoDto
{
    public string FileName { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string? LessonId { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string MimeType { get; set; } = "video/mp4";
}

public class CreateVideoLinkDto
{
    public string YoutubeUrl { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string? LessonId { get; set; }
    public string? Title { get; set; }
}
