using OpenWright.Api.Auth.Dto.Payloads;
using Revo.Core.Commands;

namespace OpenWright.BackendService.Auth.Commands;

public class CreateMyUserCommand : ICommand
{
    public required CreateMyUserPayload Payload { get; init; }
}