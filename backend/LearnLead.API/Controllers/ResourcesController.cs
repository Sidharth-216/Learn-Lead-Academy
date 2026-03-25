using System.Security.Claims;
using LearnLead.Application.DTOs.Resources;
using LearnLead.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/admin/resources")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class ResourcesController : ControllerBase
{
    private readonly ILessonResourceService _resourceService;

    public ResourcesController(ILessonResourceService resourceService)
        => _resourceService = resourceService;

    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? courseId = null)
    {
        var result = await _resourceService.GetAllAsync(page, pageSize, courseId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LessonResourceDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var resource = await _resourceService.GetByIdAsync(id);
        return Ok(resource);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(LessonResourceDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string title,
        [FromForm] string resourceType,
        [FromForm] string courseId,
        [FromForm] string lessonId)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Resource file is required." });

        if (string.IsNullOrWhiteSpace(courseId) || string.IsNullOrWhiteSpace(lessonId))
            return BadRequest(new { error = "CourseId and LessonId are required." });

        if (string.IsNullOrWhiteSpace(resourceType))
            return BadRequest(new { error = "ResourceType is required." });

        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { error = "Title is required." });

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "resources");
        Directory.CreateDirectory(uploadsRoot);

        var safeName = Path.GetFileName(file.FileName);
        var ext = Path.GetExtension(safeName);
        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsRoot, uniqueName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var publicPath = $"/uploads/resources/{uniqueName}";
        var absoluteUrl = $"{Request.Scheme}://{Request.Host}{publicPath}";

        var dto = new CreateLessonResourceDto
        {
            Title = title.Trim(),
            ResourceType = resourceType,
            CourseId = courseId,
            LessonId = lessonId,
            StoragePath = absoluteUrl,
            IsExternalLink = false,
            SizeBytes = file.Length,
            MimeType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType
        };

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Admin ID not found in token.");

        try
        {
            var resource = await _resourceService.CreateAsync(dto, adminId);
            return CreatedAtAction(nameof(GetById), new { id = resource.Id }, resource);
        }
        catch
        {
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
            throw;
        }
    }

    [HttpPost("link")]
    [ProducesResponseType(typeof(LessonResourceDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateFromLink([FromBody] CreateLessonResourceLinkDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { error = "Title is required." });

        if (string.IsNullOrWhiteSpace(dto.CourseId) || string.IsNullOrWhiteSpace(dto.LessonId))
            return BadRequest(new { error = "CourseId and LessonId are required." });

        if (string.IsNullOrWhiteSpace(dto.ResourceType))
            return BadRequest(new { error = "ResourceType is required." });

        if (!Uri.TryCreate(dto.ExternalUrl?.Trim(), UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return BadRequest(new { error = "Please provide a valid external URL." });

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Admin ID not found in token.");

        var createDto = new CreateLessonResourceDto
        {
            Title = dto.Title.Trim(),
            ResourceType = dto.ResourceType,
            CourseId = dto.CourseId,
            LessonId = dto.LessonId,
            StoragePath = dto.ExternalUrl.Trim(),
            IsExternalLink = true,
            SizeBytes = 0,
            MimeType = "external/link"
        };

        var resource = await _resourceService.CreateAsync(createDto, adminId);
        return CreatedAtAction(nameof(GetById), new { id = resource.Id }, resource);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _resourceService.DeleteAsync(id);
        return NoContent();
    }
}
