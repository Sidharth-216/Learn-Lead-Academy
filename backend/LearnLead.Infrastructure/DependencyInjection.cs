/*
using LearnLead.Application.Interfaces;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Email;
using LearnLead.Infrastructure.Persistence;
using LearnLead.Infrastructure.Repositories;
using LearnLead.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LearnLead.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration          config)
    {
        // MongoDB context — singleton is safe; MongoClient is thread-safe
        services.AddSingleton<MongoDbContext>();

        // Repositories
        services.AddScoped<IUserRepository,       UserRepository>();
        services.AddScoped<ICourseRepository,     CourseRepository>();
        services.AddScoped<IVideoRepository,      VideoRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<ISettingsRepository,   SettingsRepository>();

        // Security
        services.AddScoped<ITokenService, JwtTokenService>();

        // Email
        services.AddScoped<IEmailService, BrevoEmailService>();

        return services;
    }
}
*/

using LearnLead.Application.Interfaces;
using LearnLead.Domain.Interfaces;
using LearnLead.Infrastructure.Email;
using LearnLead.Infrastructure.Persistence;
using LearnLead.Infrastructure.Persistence.Repositories;
using LearnLead.Infrastructure.Repositories;
using LearnLead.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LearnLead.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // MongoDB context — singleton (MongoClient is thread-safe)
        services.AddSingleton<MongoDbContext>();

        // Repositories
        services.AddScoped<IUserRepository,       UserRepository>();
        services.AddScoped<ICourseRepository,     CourseRepository>();
        services.AddScoped<IVideoRepository,      VideoRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<ISettingsRepository,   SettingsRepository>();
        services.AddScoped<ILessonRepository,     LessonRepository>();  // NEW

        // Security
        services.AddScoped<ITokenService, JwtTokenService>();

        // Email
        services.AddHttpClient("brevo");
        services.AddScoped<IEmailService, BrevoEmailService>();

        return services;
    }
}