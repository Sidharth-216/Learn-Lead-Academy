using System.Security.Claims;
using LearnLead.Application.DTOs.Enrollments;
using LearnLead.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnLead.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
        => _userService = userService;

    // ── Profile ───────────────────────────────────────────────────────────────

    /// <summary>Get the currently authenticated user's profile.</summary>
    [HttpGet("me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();
        var user = await _userService.GetByIdAsync(userId);
        return Ok(user);
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    /// <summary>Get all courses the current user is enrolled in, including progress.</summary>
    [HttpGet("me/enrollments")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var userId = GetUserId();
        var enrollments = await _userService.GetMyEnrollmentsAsync(userId);
        return Ok(enrollments);
    }

    /// <summary>Enroll the current user in a course.</summary>
    [HttpPost("me/enroll/{courseId}")]
    [ProducesResponseType(typeof(EnrollmentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public IActionResult Enroll(string courseId)
    {
        return BadRequest(new
        {
            error = "Direct enrollment is disabled. Create a payment session from /api/payments/course/{courseId}/session and complete payment first."
        });
    }

    /// <summary>Update the current user's progress in an enrolled course (0–100).</summary>
    [HttpPatch("me/progress/{courseId}")]
    [ProducesResponseType(typeof(EnrollmentDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateProgress(string courseId, [FromBody] UpdateProgressDto dto)
    {
        if (dto.ProgressPercent < 0 || dto.ProgressPercent > 100)
            return BadRequest(new { error = "ProgressPercent must be between 0 and 100." });

        var userId = GetUserId();
        var result = await _userService.UpdateProgressAsync(userId, courseId, dto.ProgressPercent);
        return Ok(result);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User ID not found in token claims.");
}
