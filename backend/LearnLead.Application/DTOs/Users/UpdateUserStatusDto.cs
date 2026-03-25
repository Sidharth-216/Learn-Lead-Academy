namespace LearnLead.Application.DTOs.Users;

public class UpdateUserStatusDto
{
    /// <summary>Accepted values: "Active" or "Suspended"</summary>
    public string Status { get; set; } = string.Empty;
}
