using Microsoft.AspNetCore.Http;

namespace SomoniBank.API.Extensions;

public static class FormFileValidationExtensions
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".pdf"
    };

    public static bool HasAllowedExtension(this IFormFile? file)
    {
        if (file == null || string.IsNullOrWhiteSpace(file.FileName))
            return false;

        var extension = Path.GetExtension(file.FileName);
        return AllowedExtensions.Contains(extension);
    }
}
