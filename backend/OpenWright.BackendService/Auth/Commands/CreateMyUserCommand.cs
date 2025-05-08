using OpenWright.Api.Auth.Dto.Payloads;
using OpenWright.BackendService.Auth.Domain;
using Revo.Core.Commands;

namespace OpenWright.BackendService.Auth.Commands;

public class CreateMyUserCommand : ICommand<User>
{
    public required CreateMyUserPayload Payload { get; init; }
}