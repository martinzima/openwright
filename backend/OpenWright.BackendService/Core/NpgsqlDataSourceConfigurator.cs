using Npgsql;
using Npgsql.NameTranslation;
using OpenWright.Api.Auth.Domain;
using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Auth.Domain;
using OpenWright.Platform.PostgreSql;

namespace OpenWright.BackendService.Core;

public class NpgsqlDataSourceConfigurator : INpgsqlDataSourceConfigurator
{
    public void Build(NpgsqlDataSourceBuilder dataSourceBuilder)
    {
        dataSourceBuilder
            .MapEnum<UserRole>("ow_user_role", new NpgsqlNullNameTranslator());
        dataSourceBuilder
            .MapEnum<TestStatus>("ow_test_status", new NpgsqlNullNameTranslator());
    }
}