using Microsoft.Extensions.DependencyInjection;
using Ninject.Extensions.ContextPreservation;
using Ninject.Modules;
using Revo.AspNetCore.Core;
using Revo.Core.Core;

namespace OpenWright.Platform.AspNetCore;

[AutoLoadModule(false)]
public class AspNetCoreWebModule : NinjectModule
{
    public override void Load()
    {
        Bind<IAspNetCoreStartupConfigurer>()
            .To<AspNetCoreStartupConfigurer>()
            .InSingletonScope();

        Bind<IServiceScope>()
            .ToMethod(ctx =>
            {
                var serviceProvider = ctx.ContextPreservingGet<IServiceProvider>();
                return serviceProvider.CreateScope();
            })
            .InTaskScope();
    }
}