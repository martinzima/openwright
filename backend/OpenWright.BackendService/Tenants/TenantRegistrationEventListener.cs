using OpenWright.BackendService.Organizations.Domain;
using OpenWright.BackendService.Organizations.Domain.Events;
using Revo.Core.Commands;
using Revo.Core.Events;
using Revo.Infrastructure.Events.Async;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Tenants;

public class OrganizationRegistrationEventListener(
    OrganizationRegistrationEventListener.OrganizationRegistrationEventSequencer eventSequencer,
    IRepository repository,
    ICommandGateway commandGateway) :
    IAsyncEventListener<OrganizationRegisteredEvent>
{
    public async Task HandleAsync(IEventMessage<OrganizationRegisteredEvent> message, string sequenceName)
    {
        var organization = await repository.GetAsync<Organization>(message.Event.AggregateId);
        /*await commandGateway.SendAsync(new InitializeOrganizationDataCommand(),
            CommandExecutionOptions.Default.WithOrganizationContext(new CommandOrganizationContextOverride(organization)));*/
    }

    public Task OnFinishedEventQueueAsync(string sequenceName)
    {
        return Task.CompletedTask;
    }

    public IAsyncEventSequencer EventSequencer { get; } = eventSequencer;

    public class OrganizationRegistrationEventSequencer : IAsyncEventSequencer<OrganizationRegisteredEvent>
    {
        public readonly string QueueNamePrefix = "OrganizationRegistrationEventSequencer:";

        public IEnumerable<EventSequencing> GetEventSequencing(IEventMessage message)
        {
            yield return new EventSequencing()
            {
                SequenceName = QueueNamePrefix + (((OrganizationRegisteredEvent) message.Event).AggregateId.ToString() ?? "null"),
                EventSequenceNumber = null
            };
        }

        public bool ShouldAttemptSynchronousDispatch(IEventMessage message)
        {
            return false;
        }
    }
}