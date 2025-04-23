using OpenWright.Api.Auth.Domain;
using OpenWright.BackendService.Organizations.Domain;
using Revo.DataAccess.Entities;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Auth.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "urg")]
public class UserRoleGrant : BasicEntity
{
    public UserRoleGrant(User user, Organization organization, UserRole role)
    {
        User = user ?? throw new ArgumentNullException(nameof(user));
        OrganizationId = organization?.Id ?? throw new ArgumentNullException(nameof(organization));
        Role = role;
    }

    protected UserRoleGrant()
    {
    }
    
    public User User { get; private set; }
    public Guid OrganizationId { get; private set; }
    public UserRole Role { get; private set; }
}