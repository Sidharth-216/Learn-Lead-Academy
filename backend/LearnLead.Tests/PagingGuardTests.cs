using LearnLead.Application.Services;

namespace LearnLead.Tests;

public class PagingGuardTests
{
    [Theory]
    [InlineData(0, 0, 1, 1)]
    [InlineData(-3, -10, 1, 1)]
    [InlineData(2, 500, 2, 100)]
    [InlineData(4, 20, 4, 20)]
    public void Normalize_ClampsPageAndPageSize(int page, int pageSize, int expectedPage, int expectedPageSize)
    {
        var result = PagingGuard.Normalize(page, pageSize);

        Assert.Equal(expectedPage, result.Page);
        Assert.Equal(expectedPageSize, result.PageSize);
    }
}
