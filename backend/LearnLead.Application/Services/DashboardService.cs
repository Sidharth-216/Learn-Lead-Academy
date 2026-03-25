using LearnLead.Application.DTOs.Dashboard;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Interfaces;
using System.Linq;

namespace LearnLead.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUserRepository       _userRepo;
    private readonly ICourseRepository     _courseRepo;
    private readonly IVideoRepository      _videoRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;

    public DashboardService(
        IUserRepository       userRepo,
        ICourseRepository     courseRepo,
        IVideoRepository      videoRepo,
        IEnrollmentRepository enrollmentRepo)
    {
        _userRepo       = userRepo;
        _courseRepo     = courseRepo;
        _videoRepo      = videoRepo;
        _enrollmentRepo = enrollmentRepo;
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync()
    {
        // Run all counts concurrently for performance
        var totalCoursesTask     = _courseRepo.CountAsync();
        var totalStudentsTask    = _userRepo.CountAsync();
        var totalVideosTask      = _videoRepo.CountAsync();
        var totalEnrollmentsTask = _enrollmentRepo.CountAsync();
        var recentEnrollmentsTask = _enrollmentRepo.GetRecentAsync(10);

        await Task.WhenAll(totalCoursesTask, totalStudentsTask, totalVideosTask, totalEnrollmentsTask, recentEnrollmentsTask);

        var (allCourses, _)     = await _courseRepo.GetAllAsync(1, 1000, publishedOnly: false);
        var courseMap           = allCourses.ToDictionary(c => c.Id, c => c.Title);

        var (allUsers, _)       = await _userRepo.GetAllAsync(1, 1000);
        var userMap             = allUsers.ToDictionary(u => u.Id, u => new { u.Name, u.Email });

        // Build revenue: sum of (course.Price × studentCount) for published courses
        decimal revenue = allCourses
            .Where(c => c.IsPublished)
            .Sum(c => c.Price * c.StudentCount);

        var recentEnrollments = (await recentEnrollmentsTask).ToList();

        var recentEnrollmentDtos = recentEnrollments
            .Select(e =>
            {
                var userFound = userMap.TryGetValue(e.UserId, out var user);
                var courseFound = courseMap.TryGetValue(e.CourseId, out var courseName);

                return new RecentEnrollmentDto
                {
                    UserName = userFound ? user!.Name : "Unknown User",
                    UserEmail = userFound ? user!.Email : string.Empty,
                    CourseName = courseFound ? courseName! : "Unknown Course",
                    EnrolledAt = e.EnrolledAt
                };
            })
            .ToList();

        return new AdminDashboardDto
        {
            TotalCourses      = await totalCoursesTask,
            TotalStudents     = await totalStudentsTask,
            TotalVideos       = await totalVideosTask,
            TotalEnrollments  = await totalEnrollmentsTask,
            TotalRevenue      = revenue,
            RecentEnrollments = recentEnrollmentDtos
        };
    }
}
