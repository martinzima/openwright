using OpenWright.Api.Auth.Domain;
using OpenWright.Platform.Security;
using Revo.Core.Security;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Security;

public class UserPermissionResolver(ITenantContext tenantContext) : IUserPermissionResolver
{
    public Task<IReadOnlyCollection<Permission>> GetUserPermissionsAsync(IUser user)
    {
        if (user is IClaimsPrincipalUser claimsPrincipalUser)
        {
            var claims = claimsPrincipalUser.RoleClaims;

            var tenant = tenantContext.Tenant;
            if (tenant != null)
            {
                var permissions = claims.Where(x => x.OrganizationId == tenant.Id)
                    .Select(x => Enum.Parse<UserRole>(x.Role))
                    .SelectMany(x => UserRoleData.RolePermissions.GetValueOrDefault(x)
                        ?? throw new ArgumentException("Unknown UserRole"))
                    .Distinct()
                    .Select(x => new Permission(x, null, null))
                    .ToArray();
                return Task.FromResult<IReadOnlyCollection<Permission>>(permissions);
            }
        }

        return Task.FromResult<IReadOnlyCollection<Permission>>([]);
    }
}