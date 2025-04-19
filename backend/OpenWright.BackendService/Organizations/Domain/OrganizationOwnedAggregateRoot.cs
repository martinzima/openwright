using Revo.Core.Tenancy;
using Revo.Domain.Entities.Basic;
using Revo.Domain.Tenancy;

namespace OpenWright.BackendService.Organizations.Domain;

public abstract class OrganizationOwnedAggregateRoot : BasicAggregateRoot, ITenantOwned
{
    protected OrganizationOwnedAggregateRoot(Guid id, ITenant tenant) : base(id)
    {
        TenantId = tenant.Id;
    }
    
    protected OrganizationOwnedAggregateRoot(Guid id, Guid? tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    protected OrganizationOwnedAggregateRoot()
    {
    }

    public Guid? TenantId { get; private set; }
}