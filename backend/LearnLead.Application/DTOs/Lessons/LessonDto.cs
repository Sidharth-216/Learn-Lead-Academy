namespace LearnLead.Application.DTOs.Lessons;

public class LessonDto
{
    public string Id          { get; set; } = string.Empty;
    public string CourseId    { get; set; } = string.Empty;
    public string Title       { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Duration    { get; set; } = string.Empty;
    public int    Order       { get; set; }
    public bool   IsFree      { get; set; }
    public string? VideoId    { get; set; }
    public string? VideoUrl   { get; set; }
    public string? VideoTitle { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateLessonDto
{
    public string Title       { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Duration    { get; set; } = string.Empty;
    public int    Order       { get; set; }
    public bool   IsFree      { get; set; } = false;
    public string? VideoId    { get; set; }
}

public class UpdateLessonDto
{
    public string? Title       { get; set; }
    public string? Description { get; set; }
    public string? Duration    { get; set; }
    public int?    Order       { get; set; }
    public bool?   IsFree      { get; set; }
    public string? VideoId     { get; set; }
}