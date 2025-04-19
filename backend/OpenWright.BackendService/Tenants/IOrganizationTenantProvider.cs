using OpenWright.BackendService.Organizations.Domain;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Tenants;

public interface IOrganizationTenantProvider : ITenantProvider
{
    Organization GetTenant(Guid? id, bool throwIfDeactivated = true);
    Organization GetTenant(string urlSlug, bool throwIfDeactivated = true);
}