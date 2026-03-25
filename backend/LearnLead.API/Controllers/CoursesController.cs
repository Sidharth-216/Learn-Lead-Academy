/*using LearnLead.Application.DTOs.Courses;
using LearnLead.Application.Interfaces;
using LearnLead.Application.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/courses")]
[Produces("application/json")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
        => _courseService = courseService;

    /// <summary>Get all published courses. Supports pagination, category filter, and search.</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var result = await _courseService.GetAllPublishedAsync(page, pageSize, category, search);
        return Ok(result);
    }

    /// <summary>Get all distinct course categories.</summary>
    [HttpGet("categories")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _courseService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>Get a single published course by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CourseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var course = await _courseService.GetByIdAsync(id);
        return Ok(course);
    }
}
*/

using LearnLead.Application.DTOs.Courses;
using LearnLead.Application.DTOs.Lessons;
using LearnLead.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/courses")]
[Produces("application/json")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILessonService _lessonService;

    public CoursesController(ICourseService courseService, ILessonService lessonService)
    {
        _courseService = courseService;
        _lessonService = lessonService;
    }

    /// <summary>Get all published courses with optional pagination, category filter, and search.</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 12,
        [FromQuery] string? category = null,
        [FromQuery] string? search   = null)
    {
        var result = await _courseService.GetAllPublishedAsync(page, pageSize, category, search);
        return Ok(result);
    }

    /// <summary>Get all distinct course categories.</summary>
    [HttpGet("categories")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _courseService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>Get a single published course by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CourseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var course = await _courseService.GetByIdAsync(id);
        return Ok(course);
    }

    /// <summary>Get all lessons for a course (public — ordered by Order field).</summary>
    [HttpGet("{courseId}/lessons")]
    [ProducesResponseType(typeof(IEnumerable<LessonDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetLessons(string courseId)
    {
        var lessons = await _lessonService.GetByCourseIdAsync(courseId);
        return Ok(lessons);
    }
}