using OpenWright.Api.Projects.ValueObjects;

namespace OpenWright.Api.Reporting.Payloads;

public class CreateRunSuitePayload
{
    public required string? Title { get; init; }
    public TestLocation? Location { get; init; }
    public string? RunGroup { get; init; }
    public CreateRunSuitePayload[]? Suites { get; init; }
    public CreateRunCasePayload[]? Cases { get; init; }
}
