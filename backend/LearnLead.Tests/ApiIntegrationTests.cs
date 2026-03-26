using System.Diagnostics;

namespace LearnLead.Tests;

public class ApiIntegrationTests
{
    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task SecurityHeaders_ArePresentOnHealthResponse()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.True(response.Headers.Contains("X-Content-Type-Options"));
        Assert.True(response.Headers.Contains("X-Frame-Options"));
        Assert.True(response.Headers.Contains("Content-Security-Policy"));
        Assert.True(response.Headers.Contains("Referrer-Policy"));
    }

    [Fact]
    public async Task HealthEndpoint_HandlesConcurrentRequestsWithinReasonableTime()
    {
        await using var factory = new ApiWebApplicationFactory();
        using var client = factory.CreateClient();

        const int requestCount = 30;
        var stopwatch = Stopwatch.StartNew();

        var tasks = Enumerable.Range(0, requestCount)
            .Select(_ => client.GetAsync("/health"));

        var responses = await Task.WhenAll(tasks);
        stopwatch.Stop();

        Assert.All(responses, response => Assert.True(response.IsSuccessStatusCode));
        Assert.True(stopwatch.Elapsed < TimeSpan.FromSeconds(10),
            $"Concurrent health requests were too slow: {stopwatch.Elapsed.TotalSeconds:F2}s");
    }

}
