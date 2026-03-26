using System.Security.Claims;
using LearnLead.Application.DTOs.Videos;
using LearnLead.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/admin/videos")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class VideosController : ControllerBase
{
    private const long MaxVideoUploadBytes = 250L * 1024 * 1024;
    private static readonly HashSet<string> AllowedVideoExtensions =
    [
        ".mp4", ".webm", ".mov", ".m4v"
    ];

    private static readonly HashSet<string> AllowedVideoMimeTypes =
    [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v"
    ];

    private readonly IVideoService _videoService;

    public VideosController(IVideoService videoService)
        => _videoService = videoService;

    /// <summary>List all videos. Optionally filter by courseId.</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? courseId = null)
    {
        var result = await _videoService.GetAllAsync(page, pageSize, courseId);
        return Ok(result);
    }

    /// <summary>Get a single video record by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(VideoDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var video = await _videoService.GetByIdAsync(id);
        return Ok(video);
    }

    /// <summary>
    /// Register video metadata after the file has been uploaded to storage.
    /// The actual file upload should go directly to your storage provider (e.g. Cloudinary, S3).
    /// Only the resulting storagePath/URL is stored here.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(VideoDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateVideoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FileName))
            return BadRequest(new { error = "FileName is required." });

        if (string.IsNullOrWhiteSpace(dto.CourseId))
            return BadRequest(new { error = "CourseId is required." });

        if (string.IsNullOrWhiteSpace(dto.StoragePath))
            return BadRequest(new { error = "StoragePath is required." });

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Admin ID not found in token.");

        var video = await _videoService.CreateAsync(dto, adminId);
        return CreatedAtAction(nameof(GetById), new { id = video.Id }, video);
    }

    /// <summary>
    /// Upload a video file and register metadata in one request.
    /// Stores file under wwwroot/uploads/videos and links it to selected course/lesson.
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxVideoUploadBytes)]
    [ProducesResponseType(typeof(VideoDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string courseId,
        [FromForm] string? lessonId = null)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Video file is required." });

        if (file.Length > MaxVideoUploadBytes)
            return BadRequest(new { error = "File is too large. Max allowed size is 250 MB." });

        if (string.IsNullOrWhiteSpace(courseId))
            return BadRequest(new { error = "CourseId is required." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedVideoExtensions.Contains(ext))
            return BadRequest(new { error = "Unsupported video file type. Use MP4, WebM, MOV, or M4V." });

        var contentType = file.ContentType?.Trim().ToLowerInvariant() ?? "application/octet-stream";
        if (!AllowedVideoMimeTypes.Contains(contentType))
            return BadRequest(new { error = "Unsupported MIME type. Use MP4, WebM, MOV, or M4V video files." });

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
        Directory.CreateDirectory(uploadsRoot);

        var sanitizedName = Path.GetFileName(file.FileName);
        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsRoot, uniqueName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var publicPath = $"/uploads/videos/{uniqueName}";
        var absoluteUrl = BuildPublicAssetUrl(publicPath);

        var dto = new CreateVideoDto
        {
            FileName = sanitizedName,
            CourseId = courseId,
            LessonId = lessonId,
            StoragePath = absoluteUrl,
            SizeBytes = file.Length,
            MimeType = contentType
        };

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Admin ID not found in token.");

        try
        {
            var video = await _videoService.CreateAsync(dto, adminId);
            return CreatedAtAction(nameof(GetById), new { id = video.Id }, video);
        }
        catch
        {
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
            throw;
        }
    }

    /// <summary>
    /// Register a YouTube link as a video for a selected course/lesson.
    /// </summary>
    [HttpPost("link")]
    [ProducesResponseType(typeof(VideoDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateFromLink([FromBody] CreateVideoLinkDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CourseId))
            return BadRequest(new { error = "CourseId is required." });

        if (string.IsNullOrWhiteSpace(dto.YoutubeUrl))
            return BadRequest(new { error = "YouTube URL is required." });

        if (!TryBuildYoutubeWatchUrl(dto.YoutubeUrl, out var normalizedYoutubeUrl))
            return BadRequest(new { error = "Please provide a valid YouTube URL." });

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Admin ID not found in token.");

        var createDto = new CreateVideoDto
        {
            FileName = string.IsNullOrWhiteSpace(dto.Title)
                ? "YouTube Video"
                : dto.Title.Trim(),
            CourseId = dto.CourseId,
            LessonId = dto.LessonId,
            StoragePath = normalizedYoutubeUrl,
            SizeBytes = 0,
            MimeType = "video/youtube"
        };

        var video = await _videoService.CreateAsync(createDto, adminId);
        return CreatedAtAction(nameof(GetById), new { id = video.Id }, video);
    }

    /// <summary>Delete a video record by ID.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _videoService.DeleteAsync(id);
        return NoContent();
    }

    private static bool TryBuildYoutubeWatchUrl(string input, out string normalized)
    {
        normalized = string.Empty;
        if (!Uri.TryCreate(input.Trim(), UriKind.Absolute, out var uri))
            return false;

        var host = uri.Host.ToLowerInvariant();
        string? videoId = null;

        if (host == "youtu.be")
        {
            videoId = uri.AbsolutePath.Trim('/');
        }
        else if (host == "www.youtube.com" || host == "youtube.com" || host == "m.youtube.com")
        {
            if (uri.AbsolutePath.Equals("/watch", StringComparison.OrdinalIgnoreCase))
            {
                var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
                if (query.TryGetValue("v", out var value))
                    videoId = value.FirstOrDefault();
            }
            else if (uri.AbsolutePath.StartsWith("/embed/", StringComparison.OrdinalIgnoreCase)
                  || uri.AbsolutePath.StartsWith("/shorts/", StringComparison.OrdinalIgnoreCase))
            {
                videoId = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
            }
        }

        if (string.IsNullOrWhiteSpace(videoId))
            return false;

        var cleanId = new string(videoId.Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_').ToArray());
        if (cleanId.Length < 6)
            return false;

        normalized = $"https://www.youtube.com/watch?v={cleanId}";
        return true;
    }

    private string BuildPublicAssetUrl(string relativePath)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        return new Uri(new Uri(origin), relativePath).ToString();
    }
}
