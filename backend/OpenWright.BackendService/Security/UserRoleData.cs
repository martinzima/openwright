using OpenWright.Api.Auth.Domain;
using OpenWright.Api.Security;

namespace OpenWright.BackendService.Security;

public static class UserRoleData
{
    static UserRoleData()
    {
        var userPermissions = new[]
        {
            OpenWrightPermissions.TestRunView,
            OpenWrightPermissions.TestSuiteView
        }.Select(Guid.Parse).ToArray();
        
        var adminPermission = new[]
        {
            OpenWrightPermissions.BillingAdmin,
            OpenWrightPermissions.OrganizationAdmin,
            OpenWrightPermissions.UserAdmin
        }.Select(Guid.Parse).Concat(userPermissions).ToArray();
        
        RolePermissions = new Dictionary<UserRole, Guid[]>
        {
            { UserRole.User, userPermissions },
            { UserRole.Administrator, adminPermission }
        };
    }
    
    public static readonly IReadOnlyDictionary<UserRole, Guid[]> RolePermissions;
}