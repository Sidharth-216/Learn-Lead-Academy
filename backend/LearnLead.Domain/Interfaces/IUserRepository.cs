using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<(IEnumerable<User> Users, long Total)> GetAllAsync(int page, int pageSize, string? search = null);
    Task<long> CountAsync();
    Task CreateAsync(User user);
    Task UpdateAsync(string id, User user);
    Task DeleteAsync(string id);
}
