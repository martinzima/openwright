using OpenWright.Api.Auth.Domain;
using OpenWright.BackendService.Auth.Commands;
using OpenWright.BackendService.Auth.Domain;
using OpenWright.BackendService.Auth.Reads.Model;
using OpenWright.BackendService.Organizations.Domain;
using Revo.Core.Commands;
using Revo.Core.Security;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Organizations.Handlers;

public class OrganizationCommandHandler(
    IRepository repository,
    IReadRepository readRepository,
    IUserContext userContext) :
    ICommandHandler<CreateOrganizationCommand>
{
    public async Task HandleAsync(CreateOrganizationCommand command, CancellationToken cancellationToken)
    {
        var userOrganizationCount = await readRepository
            .Where<UserRoleGrantView>(x => x.UserId == userContext.UserId)
            .Select(x => x.OrganizationId)
            .Distinct()
            .CountAsync(readRepository, cancellationToken);
        if (userOrganizationCount >= 3)
        {
            throw new InvalidOperationException("User cannot have more than 3 organizations");
        }

        var user = await repository.GetAsync<User>(userContext.UserId.Value);

        var organization = new Organization(command.Payload.Id,
            command.Payload.Name, command.Payload.UrlSlug,
            user);

        repository.Add(organization);
        
        user.AddOrUpdateRoleGrant(Guid.NewGuid(), organization, UserRole.Administrator);
    }
}