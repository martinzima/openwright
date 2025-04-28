using System.Security.Claims;

namespace OpenWright.Platform.Security;

public class ClaimsPrincipalUser : IClaimsPrincipalUser
{
    private readonly Lazy<RoleClaim[]> roleClaims;

    public ClaimsPrincipalUser(ClaimsPrincipal principal)
    {
        Principal = principal;

        Id = principal.ResolveUserIdOrNull()
            ?? throw new InvalidOperationException("User ID not found");
        UserName = principal.Identity!.Name
            ?? throw new InvalidOperationException("User name not found");

        roleClaims = new Lazy<RoleClaim[]>(() =>
            principal.Claims
                .Where(x => x.Type == OpenWrightClaimTypes.Role)
                .Select(x => RoleClaim.DeserializeClaim(x.Value))
                .ToArray());
    }

    public Guid Id { get; }
    public string UserName { get; }
    public IReadOnlyCollection<RoleClaim> RoleClaims => roleClaims.Value;
    public ClaimsPrincipal Principal { get; }
}