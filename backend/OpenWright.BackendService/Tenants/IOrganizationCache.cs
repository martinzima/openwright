using OpenWright.BackendService.Organizations.Domain;

namespace OpenWright.BackendService.Tenants;

public interface IOrganizationCache
{
    IReadOnlyCollection<Organization> Organizations { get; }

    void AddOrganization(Organization organization);
    void UpdateOrganization(Organization organization);
    void RemoveOrganization(Organization organization);
    Organization GetOrganization(Guid id);
    Organization GetOrganization(string urlSlug);
}