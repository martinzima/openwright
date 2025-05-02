using OpenWright.Api.Organizations.Dto.Payloads;
using Revo.Core.Commands;
using Revo.Infrastructure.Security.Commands;

namespace OpenWright.BackendService.Auth.Commands;

[Authenticated]
public class CreateOrganizationCommand : ICommand
{
    public required CreateOrganizationPayload Payload { get; init; }
}