using Microsoft.EntityFrameworkCore;
using Revo.EFCore.DataAccess.Conventions;

namespace OpenWright.Platform.PostgreSql;

/// <summary>
/// When model class names are too long, EF Core generates invalid names for constraints and indexes.
/// Since we don't let the EF generate the SQL schema anyway, we can work around that
/// by setting arbitrary numbered identifiers with this convention.
/// </summary>
public class ShortConstraintNamesEFCoreConvention : EFCoreConventionBase
{
    public override void Initialize(ModelBuilder modelBuilder)
    {
    }

    public override void Finalize(ModelBuilder modelBuilder)
    {
        int i = 0;

        foreach (var entityType in modelBuilder.Model.GetEntityTypes().Where(x => !x.IsOwned()))
        {
            foreach (var key in entityType.GetKeys().Where(x => x.GetDefaultName().EndsWith("~")))
            {
                key.SetName("c_" + i);
                i++;
            }

            foreach (var foreignKey in entityType.GetForeignKeys().Where(x => x.GetDefaultName().EndsWith("~")))
            {
                foreignKey.SetConstraintName("fkey_" + i);
                i++;
            }

            foreach (var index in entityType.GetIndexes().Where(x => x.GetDefaultDatabaseName().EndsWith("~")))
            {
                index.SetDatabaseName("ix_" + i);
                i++;
            }
        }
    }
}