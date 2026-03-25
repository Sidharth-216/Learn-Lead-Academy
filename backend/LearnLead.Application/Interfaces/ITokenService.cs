using LearnLead.Domain.Entities;

namespace LearnLead.Application.Interfaces;

public interface ITokenService
{
    (string AccessToken, string RefreshToken) GenerateTokens(User user);
}
