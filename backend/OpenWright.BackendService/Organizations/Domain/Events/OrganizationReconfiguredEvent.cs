using Revo.Domain.Events;

namespace OpenWright.BackendService.Organizations.Domain.Events;

public class OrganizationReconfiguredEvent : DomainAggregateEvent
{
    public required bool IsActive { get; init; }
    public required string Name { get; init; }
    public required string UrlSlug { get; init; }
}