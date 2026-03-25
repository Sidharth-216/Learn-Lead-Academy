namespace LearnLead.Application.DTOs.Resources;

public class LessonResourceDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool IsExternalLink { get; set; }
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string LessonId { get; set; } = string.Empty;
    public string LessonTitle { get; set; } = string.Empty;
    public int LessonOrder { get; set; }
    public bool LessonIsFree { get; set; }
    public string FormattedSize { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public class CreateLessonResourceDto
{
    public string Title { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string LessonId { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public bool IsExternalLink { get; set; }
    public long SizeBytes { get; set; }
    public string MimeType { get; set; } = "application/octet-stream";
}

public class CreateLessonResourceLinkDto
{
    public string Title { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string LessonId { get; set; } = string.Empty;
    public string ExternalUrl { get; set; } = string.Empty;
}
