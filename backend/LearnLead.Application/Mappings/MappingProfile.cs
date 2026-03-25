using AutoMapper;
using LearnLead.Application.DTOs.Courses;
using LearnLead.Application.DTOs.Enrollments;
using LearnLead.Application.DTOs.Resources;
using LearnLead.Application.DTOs.Users;
using LearnLead.Application.DTOs.Videos;
using LearnLead.Domain.Entities;

namespace LearnLead.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── User ──────────────────────────────────────────────────────────
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Role,           opt => opt.MapFrom(src => src.Role.ToString()))
            .ForMember(dest => dest.Status,         opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.EnrolledCourses, opt => opt.Ignore());

        // ── Course ────────────────────────────────────────────────────────
        CreateMap<Course, CourseDto>();

        CreateMap<CreateCourseDto, Course>()
            .ForMember(dest => dest.Id,           opt => opt.Ignore())
            .ForMember(dest => dest.StudentCount, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt,    opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt,    opt => opt.Ignore());

        // ── Video ─────────────────────────────────────────────────────────
        CreateMap<Video, VideoDto>()
            .ForMember(dest => dest.FormattedSize,
                opt => opt.MapFrom(src => FormatBytes(src.SizeBytes)));

        CreateMap<CreateVideoDto, Video>()
            .ForMember(dest => dest.Id,                opt => opt.Ignore())
            .ForMember(dest => dest.PublicUrl,         opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt,        opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByAdminId, opt => opt.Ignore())
            .ForMember(dest => dest.CourseName,        opt => opt.Ignore());

        // ── Lesson Resource ──────────────────────────────────────────────
        CreateMap<LessonResource, LessonResourceDto>()
            .ForMember(dest => dest.Url, opt => opt.MapFrom(src => src.StoragePath))
            .ForMember(dest => dest.FormattedSize,
                opt => opt.MapFrom(src => src.IsExternalLink ? "External link" : FormatBytes(src.SizeBytes)));

        CreateMap<CreateLessonResourceDto, LessonResource>()
            .ForMember(dest => dest.Id,               opt => opt.Ignore())
            .ForMember(dest => dest.CourseName,       opt => opt.Ignore())
            .ForMember(dest => dest.LessonTitle,      opt => opt.Ignore())
            .ForMember(dest => dest.LessonOrder,      opt => opt.Ignore())
            .ForMember(dest => dest.LessonIsFree,     opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt,       opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByAdminId,opt => opt.Ignore());

        // ── Enrollment ────────────────────────────────────────────────────
        CreateMap<Enrollment, EnrollmentDto>()
            .ForMember(dest => dest.CourseTitle,        opt => opt.Ignore())
            .ForMember(dest => dest.CourseCategory,     opt => opt.Ignore())
            .ForMember(dest => dest.CourseThumbnailUrl, opt => opt.Ignore())
            .ForMember(dest => dest.Instructor,         opt => opt.Ignore())
            .ForMember(dest => dest.Duration,           opt => opt.Ignore());
    }

    private static string FormatBytes(long bytes)
    {
        if (bytes >= 1_073_741_824) return $"{bytes / 1_073_741_824.0:F1} GB";
        if (bytes >= 1_048_576)     return $"{bytes / 1_048_576.0:F1} MB";
        if (bytes >= 1_024)         return $"{bytes / 1_024.0:F1} KB";
        return $"{bytes} B";
    }
}
