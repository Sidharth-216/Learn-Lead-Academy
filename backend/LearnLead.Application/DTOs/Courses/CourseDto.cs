namespace LearnLead.Application.DTOs.Courses;

public class CourseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructor { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public decimal Price { get; set; }
    public double Rating { get; set; }
    public int StudentCount { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
