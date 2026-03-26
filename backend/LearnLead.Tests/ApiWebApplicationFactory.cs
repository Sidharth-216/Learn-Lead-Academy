using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LearnLead.Tests;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _environment;

    public ApiWebApplicationFactory(string environment = "Development")
    {
        _environment = environment;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(_environment);

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "ThisIsATestJwtSecretThatIsLongEnough123!",
                ["Jwt:Issuer"] = "LearnLead.Tests",
                ["Jwt:Audience"] = "LearnLead.Tests.Client",
                ["MongoDB:ConnectionString"] = "mongodb://localhost:27017",
                ["MongoDB:DatabaseName"] = "learnlead_tests",
                ["AllowedOrigins"] = "http://localhost:5173",
                ["Security:EnableSwaggerInProduction"] = "false"
            };

            configBuilder.AddInMemoryCollection(settings);
        });
    }
}
