using OpenWright.Api.Core;
using OpenWright.Api.Runs.ValueObjects;

namespace OpenWright.Api.Reporting.Payloads;

public class UpsertCaseExecutionPayload
{
    public required Guid Id { get; init; }
    public Optional<DateTimeOffset> StartDate { get; init; }
    public Optional<long> Duration { get; init; }
    public Optional<int> Retry { get; init; }
    public Optional<TestStatus?> Status { get; init; }
    public Optional<TestError[]> Errors { get; init; }
    public Optional<string[]> Stdout { get; init; }
    public Optional<string[]> Stderr { get; init; }
}
