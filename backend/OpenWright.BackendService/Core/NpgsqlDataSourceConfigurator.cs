using Npgsql;
using Npgsql.NameTranslation;
using OpenWright.BackendService.Users.Domain;
using OpenWright.Platform.PostgreSql;

namespace OpenWright.BackendService.Core;

public class NpgsqlDataSourceConfigurator : INpgsqlDataSourceConfigurator
{
    public void Build(NpgsqlDataSourceBuilder dataSourceBuilder)
    {
        dataSourceBuilder
            .MapEnum<UserRole>("ow_user_role", new NpgsqlNullNameTranslator());
    }
}