using LearnLead.Application.DTOs.Dashboard;

namespace LearnLead.Application.Interfaces;

public interface IDashboardService
{
    Task<AdminDashboardDto> GetAdminDashboardAsync();
}
