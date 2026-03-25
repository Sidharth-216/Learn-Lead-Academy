using LearnLead.Application.Interfaces;
using LearnLead.Domain.Entities;
using LearnLead.Domain.Interfaces;

namespace LearnLead.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly ISettingsRepository _settingsRepo;

    public SettingsService(ISettingsRepository settingsRepo)
        => _settingsRepo = settingsRepo;

    public async Task<AcademySettings> GetAsync()
        => await _settingsRepo.GetAsync();

    public async Task<AcademySettings> UpsertAsync(AcademySettings settings)
    {
        settings.UpdatedAt = DateTime.UtcNow;
        await _settingsRepo.UpsertAsync(settings);
        return settings;
    }
}
