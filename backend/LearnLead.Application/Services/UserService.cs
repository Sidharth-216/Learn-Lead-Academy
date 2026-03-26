using AutoMapper;
using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Enrollments;
using LearnLead.Application.DTOs.Users;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Enums;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository       _userRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly ICourseRepository     _courseRepo;
    private readonly IEmailService         _emailService;
    private readonly IMapper               _mapper;

    public UserService(
        IUserRepository       userRepo,
        IEnrollmentRepository enrollmentRepo,
        ICourseRepository     courseRepo,
        IEmailService         emailService,
        IMapper               mapper)
    {
        _userRepo       = userRepo;
        _enrollmentRepo = enrollmentRepo;
        _courseRepo     = courseRepo;
        _emailService   = emailService;
        _mapper         = mapper;
    }

    public async Task<UserDto> GetByIdAsync(string id)
    {
        var user = await _userRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("User", id);

        var dto            = _mapper.Map<UserDto>(user);
        dto.EnrolledCourses = (int)await _enrollmentRepo.CountByUserIdAsync(id);
        return dto;
    }

    public async Task<PagedResultDto<UserDto>> GetAllAsync(int page, int pageSize, string? search = null)
    {
        (page, pageSize) = PagingGuard.Normalize(page, pageSize);
        var (users, total) = await _userRepo.GetAllAsync(page, pageSize, search);

        var dtos = new List<UserDto>();
        foreach (var u in users)
        {
            var dto            = _mapper.Map<UserDto>(u);
            dto.EnrolledCourses = (int)await _enrollmentRepo.CountByUserIdAsync(u.Id);
            dtos.Add(dto);
        }

        return new PagedResultDto<UserDto>
        {
            Items    = dtos,
            Total    = total,
            Page     = page,
            PageSize = pageSize
        };
    }

    public async Task<UserDto> UpdateStatusAsync(string id, string status)
    {
        var user = await _userRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("User", id);

        if (!Enum.TryParse<UserStatus>(status, ignoreCase: true, out var parsed))
            throw new DomainException($"Invalid status '{status}'. Accepted values: Active, Suspended.");

        user.Status = parsed;
        await _userRepo.UpdateAsync(id, user);

        var dto            = _mapper.Map<UserDto>(user);
        dto.EnrolledCourses = (int)await _enrollmentRepo.CountByUserIdAsync(id);
        return dto;
    }

    public async Task<IEnumerable<EnrollmentDto>> GetMyEnrollmentsAsync(string userId)
    {
        var enrollments = await _enrollmentRepo.GetByUserIdAsync(userId);
        var result      = new List<EnrollmentDto>();

        foreach (var e in enrollments)
        {
            var course = await _courseRepo.GetByIdAsync(e.CourseId);
            if (course is null) continue;

            result.Add(new EnrollmentDto
            {
                Id                = e.Id,
                CourseId          = e.CourseId,
                CourseTitle       = course.Title,
                CourseCategory    = course.Category,
                CourseThumbnailUrl = course.ThumbnailUrl,
                Instructor        = course.Instructor,
                Duration          = course.Duration,
                ProgressPercent   = e.ProgressPercent,
                EnrolledAt        = e.EnrolledAt,
                CompletedAt       = e.CompletedAt
            });
        }

        return result;
    }

    public async Task<EnrollmentDto> EnrollAsync(string userId, string courseId)
    {
        // Guard: course must exist and be published
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new NotFoundException("Course", courseId);

        if (!course.IsPublished)
            throw new DomainException("This course is not available for enrollment.");

        // Guard: prevent duplicate enrollment
        var existing = await _enrollmentRepo.GetByUserAndCourseAsync(userId, courseId);
        if (existing is not null)
            throw new DomainException("You are already enrolled in this course.");

        var enrollment = new Enrollment
        {
            UserId    = userId,
            CourseId  = courseId,
            EnrolledAt = DateTime.UtcNow
        };

        await _enrollmentRepo.CreateAsync(enrollment);
        await _courseRepo.IncrementStudentCountAsync(courseId);

        // Fire enrollment confirmation email
        var user = await _userRepo.GetByIdAsync(userId);
        if (user is not null)
            _ = Task.Run(() => _emailService.SendEnrollmentConfirmationAsync(user.Email, user.Name, course.Title));

        return new EnrollmentDto
        {
            Id                = enrollment.Id,
            CourseId          = courseId,
            CourseTitle       = course.Title,
            CourseCategory    = course.Category,
            CourseThumbnailUrl = course.ThumbnailUrl,
            Instructor        = course.Instructor,
            Duration          = course.Duration,
            ProgressPercent   = 0,
            EnrolledAt        = enrollment.EnrolledAt
        };
    }

    public async Task<EnrollmentDto> UpdateProgressAsync(string userId, string courseId, int progressPercent)
    {
        if (progressPercent < 0 || progressPercent > 100)
            throw new DomainException("Progress must be between 0 and 100.");

        var enrollment = await _enrollmentRepo.GetByUserAndCourseAsync(userId, courseId)
            ?? throw new NotFoundException("Enrollment not found for this user and course.");

        DateTime? completedAt = progressPercent == 100 ? DateTime.UtcNow : enrollment.CompletedAt;
        await _enrollmentRepo.UpdateProgressAsync(enrollment.Id, progressPercent, completedAt);

        var course = await _courseRepo.GetByIdAsync(courseId);
        return new EnrollmentDto
        {
            Id                = enrollment.Id,
            CourseId          = courseId,
            CourseTitle       = course?.Title ?? string.Empty,
            CourseCategory    = course?.Category ?? string.Empty,
            CourseThumbnailUrl = course?.ThumbnailUrl,
            Instructor        = course?.Instructor ?? string.Empty,
            Duration          = course?.Duration ?? string.Empty,
            ProgressPercent   = progressPercent,
            EnrolledAt        = enrollment.EnrolledAt,
            CompletedAt       = completedAt
        };
    }
}
