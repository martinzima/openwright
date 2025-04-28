using System.Security.Claims;
using Revo.Core.Security;
using Revo.Core.Security.ClaimBased;

namespace OpenWright.Platform.Security;

public class ClaimsPrincipalUserResolver : IClaimsPrincipalUserResolver
{
    public Guid? TryGetUserId(ClaimsPrincipal principal)
    {
        return principal.ResolveUserIdOrNull();
    }

    public Task<IUser> GetUserAsync(ClaimsPrincipal principal)
    {
        var userId = TryGetUserId(principal);
        if (userId != null)
        {
            return Task.FromResult<IUser>(new ClaimsPrincipalUser(principal));
        }

        return Task.FromResult<IUser>(null);
    }
}