using OpenWright.BackendService.Organizations.Domain;
using OpenWright.BackendService.Organizations.Domain.Events;
using Revo.Core.Events;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Tenants;

public class OrganizationCacheUpdater(IRepository repository, IOrganizationCache organizationCache) :
    IEventListener<OrganizationRegisteredEvent>,
    IEventListener<OrganizationReconfiguredEvent>
{
    public async Task HandleAsync(IEventMessage<OrganizationRegisteredEvent> message, CancellationToken cancellationToken)
    {
        var tenant = await repository.GetAsync<Organization>(message.Event.AggregateId);
        organizationCache.AddOrganization(tenant);
    }

    public async Task HandleAsync(IEventMessage<OrganizationReconfiguredEvent> message, CancellationToken cancellationToken)
    {
        var tenant = await repository.GetAsync<Organization>(message.Event.AggregateId);
        organizationCache.UpdateOrganization(tenant);
    }
}