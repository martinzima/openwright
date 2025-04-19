using Ninject.Modules;
using Revo.Core.Core;
using Revo.Core.Events;
using Revo.Infrastructure.DataAccess.Migrations.Events;

namespace OpenWright.Platform.PostgreSql;

public class PostgreSqlModule : NinjectModule
{
    public override void Load()
    {
        Bind<IEventListener<DatabaseMigrationsCommittedEvent>>()
            .To<MigrationNpgsqlTypesReloader>()
            .InTaskScope();
    }
}