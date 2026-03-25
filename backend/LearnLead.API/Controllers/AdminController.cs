using System.Security.Claims;
using LearnLead.Application.DTOs.Courses;
using LearnLead.Application.DTOs.Lessons;
using LearnLead.Application.DTOs.Users;
using LearnLead.Application.Interfaces;
using LearnLead.Application.Validators;
using LearnLead.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IUserService      _userService;
    private readonly ICourseService    _courseService;
    private readonly ISettingsService  _settingsService;
    private readonly ILessonService    _lessonService;

    public AdminController(
        IDashboardService dashboardService,
        IUserService      userService,
        ICourseService    courseService,
        ISettingsService  settingsService,
        ILessonService    lessonService)
    {
        _dashboardService = dashboardService;
        _userService      = userService;
        _courseService    = courseService;
        _settingsService  = settingsService;
        _lessonService    = lessonService;
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = await _dashboardService.GetAdminDashboardAsync();
        return Ok(stats);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var result = await _userService.GetAllAsync(page, pageSize, search);
        return Ok(result);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(string id)
        => Ok(await _userService.GetByIdAsync(id));

    [HttpPatch("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateUserStatusDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Status))
            return BadRequest(new { error = "Status is required. Accepted values: Active, Suspended." });
        return Ok(await _userService.UpdateStatusAsync(id, dto.Status));
    }

    // ── Courses ───────────────────────────────────────────────────────────────

    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
        => Ok(await _courseService.GetAllAdminAsync(page, pageSize, search));

    [HttpGet("courses/{id}")]
    public async Task<IActionResult> GetCourse(string id)
        => Ok(await _courseService.GetByIdAsync(id));

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse(
        [FromBody] CreateCourseDto dto,
        [FromServices] CreateCourseValidator validator)
    {
        var validation = await validator.ValidateAsync(dto);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        var course = await _courseService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    [HttpPut("courses/{id}")]
    public async Task<IActionResult> UpdateCourse(string id, [FromBody] UpdateCourseDto dto)
        => Ok(await _courseService.UpdateAsync(id, dto));

    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        await _courseService.DeleteAsync(id);
        return NoContent();
    }

    // ── Lessons (admin CRUD) ──────────────────────────────────────────────────

    /// <summary>Get all lessons for a course.</summary>
    [HttpGet("courses/{courseId}/lessons")]
    [ProducesResponseType(typeof(IEnumerable<LessonDto>), 200)]
    public async Task<IActionResult> GetLessons(string courseId)
        => Ok(await _lessonService.GetByCourseIdAsync(courseId));

    /// <summary>Add a lesson to a course.</summary>
    [HttpPost("courses/{courseId}/lessons")]
    [ProducesResponseType(typeof(LessonDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateLesson(string courseId, [FromBody] CreateLessonDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { error = "Title is required." });

        var lesson = await _lessonService.CreateAsync(courseId, dto);
        return CreatedAtAction(nameof(GetLessons), new { courseId }, lesson);
    }

    /// <summary>Update a lesson.</summary>
    [HttpPut("lessons/{id}")]
    [ProducesResponseType(typeof(LessonDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateLesson(string id, [FromBody] UpdateLessonDto dto)
        => Ok(await _lessonService.UpdateAsync(id, dto));

    /// <summary>Delete a lesson.</summary>
    [HttpDelete("lessons/{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteLesson(string id)
    {
        await _lessonService.DeleteAsync(id);
        return NoContent();
    }

    // ── Settings ──────────────────────────────────────────────────────────────

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
        => Ok(await _settingsService.GetAsync());

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] AcademySettings settings)
    {
        if (string.IsNullOrWhiteSpace(settings.AcademyName))
            return BadRequest(new { error = "Academy name is required." });
        return Ok(await _settingsService.UpsertAsync(settings));
    }
}