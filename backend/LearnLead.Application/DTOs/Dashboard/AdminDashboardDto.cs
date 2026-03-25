namespace LearnLead.Application.DTOs.Dashboard;

public class AdminDashboardDto
{
    public long TotalCourses { get; set; }
    public long TotalStudents { get; set; }
    public long TotalVideos { get; set; }
    public long TotalEnrollments { get; set; }
    public decimal TotalRevenue { get; set; }
    public IEnumerable<RecentEnrollmentDto> RecentEnrollments { get; set; } = [];
}

public class RecentEnrollmentDto
{
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
}
