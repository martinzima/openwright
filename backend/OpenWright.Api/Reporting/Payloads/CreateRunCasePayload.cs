using OpenWright.Api.Projects.ValueObjects;
using OpenWright.Api.Runs.ValueObjects;

namespace OpenWright.Api.Reporting.Payloads;

public class CreateRunCasePayload
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string[]? Tags { get; init; }
    public decimal? Timeout { get; init; }
    public int? Retries { get; init; }
    public Annotation[]? Annotations { get; init; }
    public TestStatus? ExpectedStatus { get; init; }
}
