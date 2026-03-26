namespace LearnLead.Application.Services;

public static class PagingGuard
{
    private const int MinPage = 1;
    private const int MinPageSize = 1;
    private const int MaxPageSize = 100;

    public static (int Page, int PageSize) Normalize(int page, int pageSize)
    {
        var safePage = page < MinPage ? MinPage : page;
        var safePageSize = pageSize < MinPageSize ? MinPageSize : pageSize;
        if (safePageSize > MaxPageSize)
            safePageSize = MaxPageSize;

        return (safePage, safePageSize);
    }
}
