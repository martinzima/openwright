using Revo.Core.Configuration;

namespace OpenWright.Platform.PostgreSql;

public class NpgsqlConnectionParams
{
    public string Server { get; set; }
    public int Port { get; set; }
    public string Database { get; set; }
    public string UserId { get; set; }
    public string Password { get; set; }
    public int? CommandTimeout { get; set; }

    public string ToConnectionString()
    {
        if (string.IsNullOrWhiteSpace(Server))
        {
            throw new ConfigurationException($"Settings key PostgreSQL:Server is not set");
        }

        if (string.IsNullOrWhiteSpace(Database))
        {
            throw new ConfigurationException($"Settings key PostgreSQL:Database is not set");
        }

        if (string.IsNullOrWhiteSpace(UserId))
        {
            throw new ConfigurationException($"Settings key PostgreSQL:UserId is not set");
        }

        if (string.IsNullOrWhiteSpace(Password))
        {
            throw new ConfigurationException($"Settings key PostgreSQL:Password is not set");
        }

        return $"Server={Server};Port={Port};Database={Database};User Id={UserId};Password={Password};Include Error Detail=true;Command Timeout={CommandTimeout ?? 30}";
    }
}