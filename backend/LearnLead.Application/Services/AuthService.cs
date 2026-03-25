using LearnLead.Application.DTOs.Auth;
using LearnLead.Application.DTOs.Users;
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Enums;
using LearnLead.Domain.Exceptions;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService   _tokenService;
    private readonly IEmailService   _emailService;

    public AuthService(
        IUserRepository userRepo,
        ITokenService   tokenService,
        IEmailService   emailService)
    {
        _userRepo     = userRepo;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    // ── Register ─────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var existing = await _userRepo.GetByEmailAsync(dto.Email.ToLowerInvariant().Trim());
        if (existing is not null)
            throw new DomainException("An account with this email already exists.");

        var user = new User
        {
            Name         = dto.Name.Trim(),
            Email        = dto.Email.ToLowerInvariant().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: 12),
            Role         = UserRole.Student,
            Status       = UserStatus.Active
        };

        await _userRepo.CreateAsync(user);

        // fire-and-forget — never let email failure block registration
        _ = Task.Run(() => _emailService.SendWelcomeEmailAsync(user.Email, user.Name));

        return await IssueTokensAndBuildResponse(user);
    }

    // ── User Login ────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email.ToLowerInvariant().Trim())
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedException("Your account has been suspended. Contact support.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        user.LastLoginAt = DateTime.UtcNow;
        return await IssueTokensAndBuildResponse(user);
    }

    // ── Admin Login ───────────────────────────────────────────────────────
    public async Task<AuthResponseDto> AdminLoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email.ToLowerInvariant().Trim())
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (user.Role != UserRole.Admin)
            throw new UnauthorizedException("Access denied.");

        if (user.Status == UserStatus.Suspended)
            throw new UnauthorizedException("This admin account has been suspended.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        user.LastLoginAt = DateTime.UtcNow;
        return await IssueTokensAndBuildResponse(user);
    }

    // ── Refresh Token ─────────────────────────────────────────────────────
    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new UnauthorizedException("Refresh token is required.");

        var user = await _userRepo.GetByRefreshTokenAsync(refreshToken)
            ?? throw new UnauthorizedException("Invalid refresh token.");

        if (user.RefreshTokenExpiry is null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");

        return await IssueTokensAndBuildResponse(user);
    }

    // ── Logout ────────────────────────────────────────────────────────────
    public async Task LogoutAsync(string userId)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new NotFoundException("User", userId);

        user.RefreshToken       = null;
        user.RefreshTokenExpiry = null;
        await _userRepo.UpdateAsync(user.Id, user);
    }

    // ── Private helpers ───────────────────────────────────────────────────
    private async Task<AuthResponseDto> IssueTokensAndBuildResponse(User user)
    {
        var (accessToken, refreshToken) = _tokenService.GenerateTokens(user);

        user.RefreshToken       = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userRepo.UpdateAsync(user.Id, user);

        return new AuthResponseDto
        {
            AccessToken  = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id          = user.Id,
                Name        = user.Name,
                Email       = user.Email,
                Role        = user.Role.ToString(),
                Status      = user.Status.ToString(),
                CreatedAt   = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            }
        };
    }
}
