using Ninject.Modules;
using OpenWright.Platform.PostgreSql;
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
    }
}