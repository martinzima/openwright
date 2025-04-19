using Npgsql;

namespace OpenWright.Platform.PostgreSql;

public interface INpgsqlDataSourceConfigurator
{
    void Build(NpgsqlDataSourceBuilder dataSourceBuilder);
}