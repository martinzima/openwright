using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Ninject;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using Revo.Core.Configuration;
using Revo.EFCore.DataAccess.Configuration;
using Revo.EFCore.DataAccess.Conventions;

namespace OpenWright.Platform.PostgreSql;

public static class NpgsqlRevoConfigurationHelper
{
    public static IRevoConfiguration UseEFCoreWithNpgsqlFromAppSettings(this IRevoConfiguration revoConfiguration,
        IConfiguration appConfiguration,
        IKernel kernel,
        Action<DbContextOptionsBuilder> configurer = null,
        Action<NpgsqlDbContextOptionsBuilder> npgsqlConfigurer = null,
        bool? useAsPrimaryRepository = true,
        Action<EFCoreDataAccessConfigurationSection> advancedAction = null)
    {
        var npgsqlParams = appConfiguration.GetSection("PostgreSQL")
            .Get<NpgsqlConnectionParams>();
        var connectionString = npgsqlParams.ToConnectionString();

        var dataSourceLazy = new Lazy<NpgsqlDataSource>(() =>
        {
            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
            dataSourceBuilder.EnableDynamicJson();

            var configurators = kernel.GetAll<INpgsqlDataSourceConfigurator>();
            foreach (var configurator in configurators)
            {
                configurator.Build(dataSourceBuilder);
            }
                
            return dataSourceBuilder.Build();
        });

        return revoConfiguration
            .ConfigureKernel(context =>
            {
                context.Kernel
                    .Bind<NpgsqlConnectionParams>().ToConstant(npgsqlParams);
            })
            .UseEFCoreDataAccess(
                contextBuilder =>
                {
                    contextBuilder
                        .UseLoggerFactory(kernel.Get<ILoggerFactory>())
                        .ConfigureWarnings(warnings => warnings
                            .Ignore(RelationalEventId.ForeignKeyPropertiesMappedToUnrelatedTables)
                            .Log((RelationalEventId.CommandExecuted, LogLevel.Debug)));

#if DEBUG
                    contextBuilder
                        .EnableSensitiveDataLogging();
#endif

                    contextBuilder
                        .UseNpgsql(dataSourceLazy.Value,
                            npgsqlOptions =>
                            {
                                npgsqlConfigurer?.Invoke(npgsqlOptions);
                            });

                    configurer?.Invoke(contextBuilder);
                },
                advancedAction: config =>
                {
                    advancedAction?.Invoke(config);

                    config
                        .AddConvention<BaseTypeAttributeConvention>(-200)
                        .AddConvention<IdColumnsPrefixedWithTableNameConvention>(-110)
                        .AddConvention<CustomPrefixConvention>(-9)
                        .AddConvention<SnakeCaseTableNamesConvention>(1)
                        .AddConvention<SnakeCaseColumnNamesConvention>(1)
                        .AddConvention<LowerCaseConvention>(2)
                        .AddConvention<ShortConstraintNamesEFCoreConvention>(3);
                });
    }
}