namespace OpenWright.Platform.Utils;

public static class StringHelpers
{
    public static string? NullIfEmpty(this string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;

        }
        return value;
    }

    public static string? NullIfWhitespaceTrimmed(this string? value)
    {
        if (value == null)
        {
            return null;
        }

        var trimmed = value.Trim();
        if (trimmed.Length == 0)
        {
            return null;
        }

        return trimmed;
    }

    public static string? TruncateWithEllipsis(this string value, int maxLength,
        string ellipsis = "…")
    {
        return value?.Length > maxLength
            ? value.Substring(0, maxLength) + ellipsis
            : value;
    }
    
    public static string JoinStrings(this IEnumerable<string> values, string separator)
    {
        return string.Join(separator, values);
    }
}