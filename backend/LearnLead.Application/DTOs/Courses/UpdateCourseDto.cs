namespace LearnLead.Application.DTOs.Courses;

public class UpdateCourseDto
{
    public string? Title { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? Instructor { get; set; }
    public string? Duration { get; set; }
    public int? LessonCount { get; set; }
    public decimal? Price { get; set; }
    public double? Rating { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool? IsPublished { get; set; }
}
