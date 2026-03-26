using AutoMapper;
using LearnLead.Application.DTOs.Common;
using LearnLead.Application.DTOs.Videos;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class VideoService : IVideoService
{
    private readonly IVideoRepository  _videoRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly ILessonRepository _lessonRepo;
    private readonly IMapper           _mapper;

    public VideoService(
        IVideoRepository videoRepo,
        ICourseRepository courseRepo,
        ILessonRepository lessonRepo,
        IMapper mapper)
    {
        _videoRepo  = videoRepo;
        _courseRepo = courseRepo;
        _lessonRepo = lessonRepo;
        _mapper     = mapper;
    }

    public async Task<PagedResultDto<VideoDto>> GetAllAsync(int page, int pageSize, string? courseId = null)
    {
        (page, pageSize) = PagingGuard.Normalize(page, pageSize);
        var (videos, total) = await _videoRepo.GetAllAsync(page, pageSize, courseId);
        return new PagedResultDto<VideoDto>
        {
            Items    = _mapper.Map<IEnumerable<VideoDto>>(videos),
            Total    = total,
            Page     = page,
            PageSize = pageSize
        };
    }

    public async Task<VideoDto> GetByIdAsync(string id)
    {
        var video = await _videoRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Video", id);
        return _mapper.Map<VideoDto>(video);
    }

    public async Task<VideoDto> CreateAsync(CreateVideoDto dto, string adminId)
    {
        // Verify the course exists
        var course = await _courseRepo.GetByIdAsync(dto.CourseId)
            ?? throw new NotFoundException("Course", dto.CourseId);

        Lesson? lesson = null;
        if (!string.IsNullOrWhiteSpace(dto.LessonId))
        {
            lesson = await _lessonRepo.GetByIdAsync(dto.LessonId)
                ?? throw new NotFoundException("Lesson", dto.LessonId);

            if (lesson.CourseId != dto.CourseId)
                throw new DomainException("Selected lesson does not belong to the selected course.");
        }

        var video = _mapper.Map<Video>(dto);
        video.CourseName          = course.Title;
        video.UploadedAt          = DateTime.UtcNow;
        video.UploadedByAdminId   = adminId;
        video.LessonId            = lesson?.Id;

        await _videoRepo.CreateAsync(video);

        if (lesson is not null)
        {
            lesson.VideoId = video.Id;
            await _lessonRepo.UpdateAsync(lesson.Id, lesson);
        }

        return _mapper.Map<VideoDto>(video);
    }

    public async Task DeleteAsync(string id)
    {
        var video = await _videoRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Video", id);

        if (!string.IsNullOrWhiteSpace(video.LessonId))
        {
            var lesson = await _lessonRepo.GetByIdAsync(video.LessonId);
            if (lesson is not null && lesson.VideoId == video.Id)
            {
                lesson.VideoId = null;
                await _lessonRepo.UpdateAsync(lesson.Id, lesson);
            }
        }

        await _videoRepo.DeleteAsync(video.Id);
    }
}
