using LearnLead.Domain.Entities;

namespace LearnLead.Domain.Interfaces;

public interface ISettingsRepository
{
    /// <summary>Returns the single AcademySettings document (upserts if missing).</summary>
    Task<AcademySettings> GetAsync();
    Task UpsertAsync(AcademySettings settings);
}
