using OpenWright.BackendService.Organizations.Domain;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Tenants;

public class OrganizationManager(IRepository repository) : IOrganizationManager
{
    public Task<Organization> GetOrganizationAsync(Guid id)
    {
        return repository.GetAsync<Organization>(id);
    }

    public async Task<Organization[]> GetActiveOrganizationsAsync()
    {
        return await repository
            .FindAll<Organization>()
            .ToArrayAsync(repository.GetQueryableResolver<Organization>());
    }

    public async Task<Organization[]> GetAllOrganizationsAsync()
    {
        return await repository
            .FindAll<Organization>()
            .Where(x => x.IsActive)
            .ToArrayAsync(repository.GetQueryableResolver<Organization>());
    }
}