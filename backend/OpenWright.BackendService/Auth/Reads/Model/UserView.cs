using OpenWright.BackendService.Auth.Domain;
using Revo.Domain.ReadModel;

namespace OpenWright.BackendService.Auth.Reads.Model;

[ReadModelForEntity(typeof(User))]
public class UserView : EntityView
{
    public string EmailAddress { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public IReadOnlyCollection<UserRoleGrantView> RoleGrants { get; set; }
}