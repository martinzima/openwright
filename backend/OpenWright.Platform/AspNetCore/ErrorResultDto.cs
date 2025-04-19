namespace OpenWright.Platform.AspNetCore;

public class ErrorResultDto
{
    public IReadOnlyDictionary<string, object> Data { get; init; }
    public string Error { get; init; }
    public string TraceId { get; init; }
}