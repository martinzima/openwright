using Revo.Domain.Events;

namespace OpenWright.BackendService.Organizations.Domain.Events;

public class OrganizationRegisteredEvent : DomainAggregateEvent
{
    public required Guid OrganizationId { get; init; }
}