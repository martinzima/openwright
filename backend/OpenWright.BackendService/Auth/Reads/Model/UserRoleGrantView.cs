using OpenWright.Api.Auth.Domain;
using OpenWright.BackendService.Auth.Domain;
using OpenWright.BackendService.Organizations.Reads.Model;
using Revo.Domain.ReadModel;

namespace OpenWright.BackendService.Auth.Reads.Model;

[ReadModelForEntity(typeof(UserRoleGrant))]
public class UserRoleGrantView : EntityView
{
    public Guid UserId { get; set; }
    public UserView User { get; set; }
    public Guid OrganizationId { get; set; }
    public OrganizationView Organization { get; set; }
    public UserRole Role { get; set; }
}