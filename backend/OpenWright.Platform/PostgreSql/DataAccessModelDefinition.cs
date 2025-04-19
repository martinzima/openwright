using Microsoft.EntityFrameworkCore;
using Revo.EFCore.DataAccess.Model;

// ReSharper disable InvokeAsExtensionMethod

namespace OpenWright.Platform.PostgreSql;

public class DataAccessModelDefinition : IEFCoreModelDefinition
{
    public void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDbFunction(() => PgsqlFunctions.UuidContains(default(Guid[]), default(Guid)));
        modelBuilder.HasDbFunction(() => PgsqlFunctions.UuidContainsArray(default(Guid[]), default(Guid[])));
        modelBuilder.HasDbFunction(() => PgsqlFunctions.UuidIsContainedByArray(default(Guid[]), default(Guid[])));
        modelBuilder.HasDbFunction(() => PgsqlFunctions.UuidArrayOverlap(default(Guid[]), default(Guid[])));
        modelBuilder.HasDbFunction(() => PgsqlFunctions.BaseToTsVector(default(string)));

        modelBuilder.HasPostgresExtension("postgis");
    }
}