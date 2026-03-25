namespace LearnLead.Application.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string name);
    Task SendEnrollmentConfirmationAsync(string toEmail, string name, string courseName);
    Task SendPasswordResetEmailAsync(string toEmail, string name, string resetLink);
}
