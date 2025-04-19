using OpenWright.Api.Runs.ValueObjects;

namespace OpenWright.Api.Reporting.Payloads;

public class CreateRunPayload
{
    public required Guid Id { get; init; }
    public required Guid ProjectId { get; init; }
    public required DateTimeOffset StartDate { get; init; }
    public required CreateRunSuitePayload[] Suites { get; init; }
    public string? Description { get; init; }
    public int? PullRequestNumber { get; init; }
    public CommitInfo? Commit { get; init; }
    public ActorInfo? Actor { get; init; }
}
