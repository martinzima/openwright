using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenWright.Platform.Security;

public record RoleClaim
{
    public required string Role { get; init; }
    public required Guid OrganizationId { get; init; }

    public static RoleClaim DeserializeClaim(string json)
    {
        var arr = JArray.Parse(json);
        if (arr.Count != 2)
        {
            throw new ArgumentException("Invalid role claim format", nameof(json));
        }

        var role = (string?) arr[0];
        var organizationId = (Guid) arr[1];

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new ArgumentException("Role cannot be null or whitespace", nameof(role));
        }
            
        return new RoleClaim()
        {
            Role = role,
            OrganizationId = organizationId
        };
    }

    public string SerializeClaim()
    {
        return JsonConvert.SerializeObject(new object[] {
            Role,
            OrganizationId
        });
    }
}