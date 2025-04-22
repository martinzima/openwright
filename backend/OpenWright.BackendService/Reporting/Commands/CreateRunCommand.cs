using OpenWright.Api.Reporting.Payloads;
using Revo.Core.Commands;

namespace OpenWright.BackendService.Reporting.Commands;

public class CreateRunCommand : ICommand
{
    public required CreateRunPayload Payload { get; init; }
}