using Revo.Core.Security;

namespace OpenWright.Platform.Security;

public interface IClaimsPrincipalUser : IUser
{
    IReadOnlyCollection<RoleClaim> RoleClaims { get; }
}