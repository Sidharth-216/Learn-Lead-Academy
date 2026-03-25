using AutoMapper;
using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Resources;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class LessonResourceService : ILessonResourceService
{
    private static readonly HashSet<string> AllowedResourceTypes =
    [
        "notes",
        "practice",
        "starter"
    ];

    private readonly ILessonResourceRepository _resourceRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly ILessonRepository _lessonRepo;
    private readonly IMapper _mapper;

    public LessonResourceService(
        ILessonResourceRepository resourceRepo,
        ICourseRepository courseRepo,
        ILessonRepository lessonRepo,
        IMapper mapper)
    {
        _resourceRepo = resourceRepo;
        _courseRepo = courseRepo;
        _lessonRepo = lessonRepo;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<LessonResourceDto>> GetAllAsync(int page, int pageSize, string? courseId = null)
    {
        var (items, total) = await _resourceRepo.GetAllAsync(page, pageSize, courseId);
        return new PagedResultDto<LessonResourceDto>
        {
            Items = _mapper.Map<IEnumerable<LessonResourceDto>>(items),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<LessonResourceDto>> GetByCourseIdAsync(string courseId)
    {
        _ = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new NotFoundException("Course", courseId);

        var items = await _resourceRepo.GetByCourseIdAsync(courseId);
        return _mapper.Map<IEnumerable<LessonResourceDto>>(items);
    }

    public async Task<LessonResourceDto> GetByIdAsync(string id)
    {
        var resource = await _resourceRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Resource", id);

        return _mapper.Map<LessonResourceDto>(resource);
    }

    public async Task<LessonResourceDto> CreateAsync(CreateLessonResourceDto dto, string adminId)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new DomainException("Resource title is required.");

        var resourceType = NormalizeResourceType(dto.ResourceType);

        var course = await _courseRepo.GetByIdAsync(dto.CourseId)
            ?? throw new NotFoundException("Course", dto.CourseId);

        var lesson = await _lessonRepo.GetByIdAsync(dto.LessonId)
            ?? throw new NotFoundException("Lesson", dto.LessonId);

        if (lesson.CourseId != dto.CourseId)
            throw new DomainException("Selected lesson does not belong to the selected course.");

        var resource = _mapper.Map<LessonResource>(dto);
        resource.Title = dto.Title.Trim();
        resource.ResourceType = resourceType;
        resource.CourseName = course.Title;
        resource.LessonTitle = lesson.Title;
        resource.LessonOrder = lesson.Order;
        resource.LessonIsFree = lesson.IsFree;
        resource.UploadedAt = DateTime.UtcNow;
        resource.UploadedByAdminId = adminId;

        await _resourceRepo.CreateAsync(resource);
        return _mapper.Map<LessonResourceDto>(resource);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await _resourceRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Resource", id);

        await _resourceRepo.DeleteAsync(id);
    }

    private static string NormalizeResourceType(string type)
    {
        var normalized = type.Trim().ToLowerInvariant();
        if (!AllowedResourceTypes.Contains(normalized))
            throw new DomainException("ResourceType must be one of: notes, practice, starter.");

        return normalized;
    }
}
