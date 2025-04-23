using Ninject.Modules;
using OpenWright.BackendService.Auth.Services;
using Revo.Core.Core;

namespace OpenWright.BackendService.Auth;

public class Module : NinjectModule
{
    public override void Load()
    {
        Bind<ISignInService>()
            .To<SignInService>()
            .InTaskScope();
    }
}