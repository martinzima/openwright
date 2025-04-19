using Microsoft.EntityFrameworkCore;
using Npgsql;
using Revo.Core.Events;
using Revo.Domain.Entities.Basic;
using Revo.EFCore.DataAccess.Entities;
using Revo.Infrastructure.DataAccess.Migrations.Events;

namespace OpenWright.Platform.PostgreSql;

public class MigrationNpgsqlTypesReloader :
    IEventListener<DatabaseMigrationsCommittedEvent>
{
    private readonly Lazy<IEFCoreCrudRepository> crudRepository;

    public MigrationNpgsqlTypesReloader(Lazy<IEFCoreCrudRepository> crudRepository)
    {
        this.crudRepository = crudRepository;
    }

    public async Task HandleAsync(IEventMessage<DatabaseMigrationsCommittedEvent> message, CancellationToken cancellationToken)
    {
        var dbConnection = crudRepository.Value.DatabaseAccess.GetDbContext(typeof(BasicEntity))
            .Database.GetDbConnection();
        if (dbConnection is NpgsqlConnection npgsqlConnection)
        {
            await npgsqlConnection.ReloadTypesAsync();
        }
    }
}