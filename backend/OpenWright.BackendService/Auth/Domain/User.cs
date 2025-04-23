using OpenWright.Api.Auth.Domain;
using OpenWright.BackendService.Organizations.Domain;
using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Auth.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "usr")]
public class User : BasicAggregateRoot
{
    private List<UserRoleGrant> roleGrants = new();
    
    public User(Guid id, EmailAddress emailAddress) : base(id)
    {
        UpdateEmailAddress(emailAddress);
    }

    protected User()
    {
    }
    
    public string EmailAddress { get; private set; }
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public IReadOnlyCollection<UserRoleGrant> RoleGrants => roleGrants;
    
    public void UpdateEmailAddress(EmailAddress emailAddress)
    {
        if (emailAddress.Address != EmailAddress)
        {
            EmailAddress = emailAddress.Address;
        }
    }
    
    public void UpdateName(string firstName, string lastName)
    {
        FirstName = firstName?.NullIfWhitespaceTrimmed();
        LastName = lastName?.NullIfWhitespaceTrimmed();
    }
    
    public void AddOrUpdateRoleGrant(Organization organization, UserRole role)
    {
        if (organization == null)
        {
            throw new ArgumentNullException(nameof(organization));
        }
        
        var existingGrant = roleGrants.FirstOrDefault(x => x.OrganizationId == organization.Id);
        if (existingGrant != null)
        {
            roleGrants.Remove(existingGrant);
        }
        
        var roleGrant = new UserRoleGrant(this, organization, role);
        roleGrants.Add(roleGrant);
    }
    
    public void RemoveRoleGrant(Organization organization)
    {
        if (organization == null)
        {
            throw new ArgumentNullException(nameof(organization));
        }
        
        var existingGrant = roleGrants.FirstOrDefault(x => x.OrganizationId == organization.Id);
        if (existingGrant == null)
        {
            throw new DomainException($"User does not have a role grant for organization {organization.Id}");
        }
        
        roleGrants.Remove(existingGrant);
    }
}