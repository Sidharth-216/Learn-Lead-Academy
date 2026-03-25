using AutoMapper;
using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Courses;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepo;
    private readonly IMapper           _mapper;

    public CourseService(ICourseRepository courseRepo, IMapper mapper)
    {
        _courseRepo = courseRepo;
        _mapper     = mapper;
    }

    public async Task<PagedResultDto<CourseDto>> GetAllPublishedAsync(
        int page, int pageSize, string? category = null, string? search = null)
    {
        var (courses, total) = await _courseRepo.GetAllAsync(page, pageSize, category, search, publishedOnly: true);
        return new PagedResultDto<CourseDto>
        {
            Items    = _mapper.Map<IEnumerable<CourseDto>>(courses),
            Total    = total,
            Page     = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<CourseDto>> GetAllAdminAsync(
        int page, int pageSize, string? search = null)
    {
        var (courses, total) = await _courseRepo.GetAllAsync(page, pageSize, null, search, publishedOnly: false);
        return new PagedResultDto<CourseDto>
        {
            Items    = _mapper.Map<IEnumerable<CourseDto>>(courses),
            Total    = total,
            Page     = page,
            PageSize = pageSize
        };
    }

    public async Task<CourseDto> GetByIdAsync(string id)
    {
        var course = await _courseRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Course", id);
        return _mapper.Map<CourseDto>(course);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
        => await _courseRepo.GetDistinctCategoriesAsync();

    public async Task<CourseDto> CreateAsync(CreateCourseDto dto)
    {
        var course = _mapper.Map<Course>(dto);
        course.CreatedAt = DateTime.UtcNow;
        course.UpdatedAt = DateTime.UtcNow;

        await _courseRepo.CreateAsync(course);
        return _mapper.Map<CourseDto>(course);
    }

    public async Task<CourseDto> UpdateAsync(string id, UpdateCourseDto dto)
    {
        var course = await _courseRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Course", id);

        // Patch only supplied fields
        if (dto.Title       is not null) course.Title       = dto.Title;
        if (dto.Category    is not null) course.Category    = dto.Category;
        if (dto.Description is not null) course.Description = dto.Description;
        if (dto.Instructor  is not null) course.Instructor  = dto.Instructor;
        if (dto.Duration    is not null) course.Duration    = dto.Duration;
        if (dto.LessonCount is not null) course.LessonCount = dto.LessonCount.Value;
        if (dto.Price       is not null) course.Price       = dto.Price.Value;
        if (dto.Rating      is not null) course.Rating      = dto.Rating.Value;
        if (dto.ThumbnailUrl is not null) course.ThumbnailUrl = dto.ThumbnailUrl;
        if (dto.IsPublished  is not null) course.IsPublished  = dto.IsPublished.Value;
        course.UpdatedAt = DateTime.UtcNow;

        await _courseRepo.UpdateAsync(id, course);
        return _mapper.Map<CourseDto>(course);
    }

    public async Task DeleteAsync(string id)
    {
        var course = await _courseRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Course", id);
        await _courseRepo.DeleteAsync(course.Id);
    }
}
