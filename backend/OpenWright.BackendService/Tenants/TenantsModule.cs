using Ninject.Modules;
using OpenWright.BackendService.Organizations.Domain.Events;
using Revo.Core.Core;
using Revo.Core.Events;
using Revo.Infrastructure.Events.Async;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Tenants;

public class TenantsModule : NinjectModule
{
    public override void Load()
    {
        Bind<ITenantContextResolver>()
            .To<TenantContextResolver>()
            .InTaskScope();

        Rebind<IOrganizationManager>()
            .To<OrganizationManager>()
            .InTaskScope();

        Bind<IEventListener<OrganizationRegisteredEvent>,
                IEventListener<OrganizationReconfiguredEvent>>()
            .To<OrganizationCacheUpdater>()
            .InTaskScope();

        Bind<IOrganizationCache>()
            .To<OrganizationCache>()
            .InSingletonScope();

        Bind<ITenantProvider, IOrganizationTenantProvider>()
            .To<OrganizationTenantProvider>()
            .InSingletonScope();

        this.BindAsyncEventListener<OrganizationRegistrationEventListener,
            OrganizationRegistrationEventListener.OrganizationRegistrationEventSequencer>();
    }
}