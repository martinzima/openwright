using OpenWright.Api.Reporting.Payloads;
using Revo.Core.Commands;

namespace OpenWright.BackendService.Reporting.Commands;

public class UpsertCaseExecutionsCommand : ICommand
{
    public required Guid RunId { get; init; }
    public required UpsertCaseExecutionPayload[] Payload { get; init; }
}