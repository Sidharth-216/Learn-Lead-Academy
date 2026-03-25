using LearnLead.Application.DTOs.Lessons;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;
using System.Text;
using System.Text.RegularExpressions;

namespace LearnLead.Application.Services;

public class LessonService : ILessonService
{
    private readonly ILessonRepository _lessonRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IVideoRepository  _videoRepo;

    public LessonService(
        ILessonRepository lessonRepo,
        ICourseRepository courseRepo,
        IVideoRepository videoRepo)
    {
        _lessonRepo = lessonRepo;
        _courseRepo = courseRepo;
        _videoRepo  = videoRepo;
    }

    public async Task<IEnumerable<LessonDto>> GetByCourseIdAsync(string courseId)
    {
        // Verify course exists
        _ = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new NotFoundException("Course", courseId);

        var lessons = await _lessonRepo.GetByCourseIdAsync(courseId);
        var mapped = await Task.WhenAll(lessons.Select(MapToDtoAsync));
        return mapped;
    }

    public async Task<LessonDto> GetByIdAsync(string id)
    {
        var lesson = await _lessonRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Lesson", id);
        return await MapToDtoAsync(lesson);
    }

    public async Task<LessonDto> CreateAsync(string courseId, CreateLessonDto dto)
    {
        // Verify course exists
        _ = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new NotFoundException("Course", courseId);

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new DomainException("Lesson title is required.");

        var normalizedVideoId = string.IsNullOrWhiteSpace(dto.VideoId)
            ? null
            : NormalizeToObjectId(dto.VideoId);

        if (!string.IsNullOrWhiteSpace(dto.VideoId))
        {
            dto.VideoId = normalizedVideoId;
        }

        var lesson = new Lesson
        {
            CourseId    = courseId,
            Title       = dto.Title.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Duration    = dto.Duration?.Trim()    ?? string.Empty,
            Order       = dto.Order,
            IsFree      = dto.IsFree,
            VideoId     = normalizedVideoId,
            CreatedAt   = DateTime.UtcNow
        };

        await _lessonRepo.CreateAsync(lesson);
        return await MapToDtoAsync(lesson);
    }

    public async Task<LessonDto> UpdateAsync(string id, UpdateLessonDto dto)
    {
        var lesson = await _lessonRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Lesson", id);

        var normalizedVideoId = string.IsNullOrWhiteSpace(dto.VideoId)
            ? null
            : NormalizeToObjectId(dto.VideoId);

        if (dto.VideoId is not null && !string.IsNullOrWhiteSpace(dto.VideoId))
        {
            dto.VideoId = normalizedVideoId;
        }

        if (dto.Title       is not null) lesson.Title       = dto.Title.Trim();
        if (dto.Description is not null) lesson.Description = dto.Description.Trim();
        if (dto.Duration    is not null) lesson.Duration    = dto.Duration.Trim();
        if (dto.Order       is not null) lesson.Order       = dto.Order.Value;
        if (dto.IsFree      is not null) lesson.IsFree      = dto.IsFree.Value;
        if (dto.VideoId     is not null) lesson.VideoId     = normalizedVideoId;

        await _lessonRepo.UpdateAsync(id, lesson);
        return await MapToDtoAsync(lesson);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await _lessonRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Lesson", id);
        await _lessonRepo.DeleteAsync(id);
    }

    private async Task<LessonDto> MapToDtoAsync(Lesson lesson)
    {
        string? videoUrl = null;
        string? videoTitle = null;

        if (!string.IsNullOrWhiteSpace(lesson.VideoId) && IsValidObjectId(lesson.VideoId))
        {
            var video = await _videoRepo.GetByIdAsync(lesson.VideoId);
            if (video is not null)
            {
                videoUrl = !string.IsNullOrWhiteSpace(video.PublicUrl)
                    ? video.PublicUrl
                    : video.StoragePath;
                videoTitle = video.FileName;
            }
        }

        return new LessonDto
        {
            Id          = lesson.Id,
            CourseId    = lesson.CourseId,
            Title       = lesson.Title,
            Description = lesson.Description,
            Duration    = lesson.Duration,
            Order       = lesson.Order,
            IsFree      = lesson.IsFree,
            VideoId     = lesson.VideoId,
            VideoUrl    = videoUrl,
            VideoTitle  = videoTitle,
            CreatedAt   = lesson.CreatedAt
        };
    }

    private static bool IsValidObjectId(string id)
        => Regex.IsMatch(id, "^[a-fA-F0-9]{24}$");

    private static string NormalizeToObjectId(string id)
    {
        var trimmed = id.Trim();
        if (IsValidObjectId(trimmed))
            return trimmed.ToLowerInvariant();

        var hex = Convert.ToHexString(Encoding.UTF8.GetBytes(trimmed)).ToLowerInvariant();
        return hex.Length >= 24
            ? hex[..24]
            : hex.PadRight(24, '0');
    }
}