namespace OpenWright.Api.Runs.ValueObjects;

public record CommitInfo(string? Sha, string? Branch, string? Message, string? Url, DateTimeOffset? Date, string? Author);
