namespace LearnLead.Application.DTOs.Enrollments;

public class EnrollmentDto
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseCategory { get; set; } = string.Empty;
    public string? CourseThumbnailUrl { get; set; }
    public string Instructor { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class UpdateProgressDto
{
    /// <summary>Value between 0 and 100 inclusive.</summary>
    public int ProgressPercent { get; set; }
}
