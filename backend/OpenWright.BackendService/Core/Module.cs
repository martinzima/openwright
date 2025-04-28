using Ninject.Modules;
using OpenWright.BackendService.Security;
using OpenWright.Platform.PostgreSql;
using Revo.Core.Core;
using Revo.Core.Security;
using Revo.Infrastructure.DataAccess.Migrations;

namespace OpenWright.BackendService.Core;

public class Module : NinjectModule
{
    public override void Load()
    {
        Bind<ResourceDatabaseMigrationDiscoveryAssembly>()
            .ToConstant(new ResourceDatabaseMigrationDiscoveryAssembly(GetType().Assembly, "Sql"))
            .InSingletonScope();

        Bind<INpgsqlDataSourceConfigurator>()
            .To<NpgsqlDataSourceConfigurator>()
            .InTransientScope();
        
        Bind<IUserPermissionResolver>()
            .To<UserPermissionResolver>()
            .InTaskScope();
    }
}