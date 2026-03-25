/*using FluentValidation;
using LearnLead.Application.Interfaces;
using LearnLead.Application.Mappings;
using LearnLead.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LearnLead.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        // FluentValidation — scans entire Application assembly
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Services
        services.AddScoped<IAuthService,      AuthService>();
        services.AddScoped<ICourseService,    CourseService>();
        services.AddScoped<IUserService,      UserService>();
        services.AddScoped<IVideoService,     VideoService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ISettingsService,  SettingsService>();

        return services;
    }
}
*/
using FluentValidation;
using LearnLead.Application.Interfaces;
using LearnLead.Application.Mappings;
using LearnLead.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LearnLead.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService,      AuthService>();
        services.AddScoped<ICourseService,    CourseService>();
        services.AddScoped<IUserService,      UserService>();
        services.AddScoped<IVideoService,     VideoService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ISettingsService,  SettingsService>();
        services.AddScoped<ILessonService,    LessonService>();  // NEW
        services.AddScoped<ILessonResourceService, LessonResourceService>();

        return services;
    }
}