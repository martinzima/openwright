using Ninject.Modules;
using Revo.Core.Security.ClaimBased;

namespace OpenWright.Platform.Security;

public class SecurityModule : NinjectModule
{
    public override void Load()
    {
        Bind<IClaimsPrincipalUserResolver>()
            .To<ClaimsPrincipalUserResolver>()
            .InSingletonScope();
    }
}