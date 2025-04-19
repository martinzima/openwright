using System.Collections.Concurrent;
using OpenWright.BackendService.Organizations.Domain;
using Revo.Core.Core;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Tenants;

public class OrganizationCache : IOrganizationCache
{
    private readonly Lazy<ConcurrentDictionary<Guid, Organization>> organizations;

    public OrganizationCache(Func<IReadRepository> readRepositoryFunc)
    {
        organizations = new Lazy<ConcurrentDictionary<Guid,Organization>>(() =>
        {
            using (TaskContext.Enter())
            {
                var readRepository = readRepositoryFunc();

                var organizations = readRepository
                    .ExcludeFilters(typeof(TenantRepositoryFilter))
                    .FindAll<Organization>();

                return new ConcurrentDictionary<Guid, Organization>(
                    organizations.ToDictionary(x => x.Id, x => x));
            }
        });
    }

    public IReadOnlyCollection<Organization> Organizations => organizations.Value.Values.ToArray();

    public void AddOrganization(Organization organization)
    {
        organizations.Value[organization.Id] = organization;
    }

    public void UpdateOrganization(Organization organization)
    {
        organizations.Value[organization.Id] = organization;
    }

    public void RemoveOrganization(Organization organization)
    {
        organizations.Value.TryRemove(organization.Id, out _);
    }

    public Organization GetOrganization(Guid id)
    {
        if (!organizations.Value.TryGetValue(id, out var organization))
        {
            throw new EntityNotFoundException($"Organization with ID '{id}' not found");
        }

        return organization;
    }

    public Organization GetOrganization(string urlSlug)
    {
        // TODO build a dictionary for perf?
        var lowerUrlSlug = urlSlug.ToLowerInvariant();
        var organization = organizations.Value.FirstOrDefault(x => x.Value.UrlSlug.ToLowerInvariant() == lowerUrlSlug).Value
                     ?? throw new EntityNotFoundException($"Organization with URL slug {urlSlug} not found");
        return organization;
    }
}