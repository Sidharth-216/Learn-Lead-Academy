using LearnLead.Domain.Entities;

namespace LearnLead.Application.Interfaces;

public interface ISettingsService
{
    Task<AcademySettings> GetAsync();
    Task<AcademySettings> UpsertAsync(AcademySettings settings);
}
