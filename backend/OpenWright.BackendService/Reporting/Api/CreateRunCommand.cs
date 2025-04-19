using OpenWright.Api.Reporting.Payloads;
using Revo.Core.Commands;

namespace OpenWright.BackendService.Reporting.Api;

public class CreateRunCommand : ICommand
{
    public required CreateRunPayload Payload { get; init; }
}