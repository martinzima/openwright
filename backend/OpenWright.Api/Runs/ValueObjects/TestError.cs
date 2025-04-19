namespace OpenWright.Api.Runs.ValueObjects;

public record TestError(string Message, string? Stack, string? Value);
