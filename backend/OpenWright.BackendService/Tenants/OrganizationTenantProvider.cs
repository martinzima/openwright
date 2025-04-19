using OpenWright.BackendService.Organizations.Domain;
using Revo.Core.Tenancy;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Tenants;

public class OrganizationTenantProvider(IOrganizationCache organizationCache) : IOrganizationTenantProvider
{
    public Organization GetTenant(Guid? id, bool throwIfDeactivated = true)
    {
        if (id == null)
        {
            return null;
        }

        var organization = organizationCache.GetOrganization(id.Value);
        if (!organization.IsActive && throwIfDeactivated)
        {
            throw new EntityNotFoundException($"Organization {organization} has been deactivated");
        }

        return organization;
    }

    public Organization GetTenant(string urlSlug, bool throwIfDeactivated = true)
    {
        var organization = organizationCache.GetOrganization(urlSlug);
        if (!organization.IsActive && throwIfDeactivated)
        {
            throw new EntityNotFoundException($"Organization {organization} has been deactivated");
        }

        return organization;
    }

    ITenant ITenantProvider.GetTenant(Guid? id)
    {
        return GetTenant(id);
    }
}