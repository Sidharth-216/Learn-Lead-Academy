using FluentValidation;
using LearnLead.Application.DTOs.Courses;

namespace LearnLead.Application.Validators;

public class CreateCourseValidator : AbstractValidator<CreateCourseDto>
{
    public CreateCourseValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100);

        // Description, Instructor, Duration are optional — validate only if provided
        RuleFor(x => x.Description)
            .MaximumLength(5000)
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Instructor)
            .MaximumLength(150)
            .When(x => !string.IsNullOrEmpty(x.Instructor));

        RuleFor(x => x.Duration)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.Duration));

        RuleFor(x => x.LessonCount)
            .GreaterThanOrEqualTo(0).WithMessage("Lesson count cannot be negative.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 5).WithMessage("Rating must be between 0 and 5.");

        // Only validate URL format if ThumbnailUrl is actually provided and non-empty
        RuleFor(x => x.ThumbnailUrl)
            .MaximumLength(500)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("ThumbnailUrl must be a valid absolute URL (e.g. https://...).")
            .When(x => !string.IsNullOrWhiteSpace(x.ThumbnailUrl));
    }
}