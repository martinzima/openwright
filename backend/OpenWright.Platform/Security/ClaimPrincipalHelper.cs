using System.Security.Claims;

namespace OpenWright.Platform.Security;

public static class ClaimPrincipalHelper
{
    public static Guid? ResolveUserIdOrNull(this ClaimsPrincipal principal)
    {
        if (principal.Identity?.AuthenticationType != AuthenticationConsts.AuthenticationScheme
            || !principal.Identity.IsAuthenticated)
        {
            return null;
        }
        
        return Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)
            ?.Value ?? throw new InvalidOperationException("User ID claim not found"));
    }
}