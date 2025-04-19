using OpenWright.BackendService.Organizations.Domain.Events;
using OpenWright.Platform.Utils;
using Revo.Core.Tenancy;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Organizations.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "org")]
public class Organization : BasicAggregateRoot, ITenant
{
    public Organization(Guid id, string name, string urlSlug) : base(id)
    {
        Publish(new OrganizationRegisteredEvent()
        {
            OrganizationId = id
        });
        
        Reconfigure(name, true, urlSlug);
    }
    
    protected Organization()
    {
    }
    
    public string Name { get; private set; }
    public string UrlSlug { get; private set; }
    public bool IsActive { get; private set; }
    
    public void Reconfigure(string name, bool isActive, string urlSlug)
    {
        if (IsActive != isActive || Name != name || UrlSlug != urlSlug)
        {
            IsActive = isActive;
            Name = name?.NullIfWhitespaceTrimmed()
                   ?? throw new DomainException("Tenant name cannot be null or whitespace");
            UrlSlug = urlSlug?.NullIfWhitespaceTrimmed()
                      ?? throw new DomainException("Tenant URL slug cannot be null or whitespace");

            Publish(new OrganizationReconfiguredEvent()
            {
                IsActive = isActive,
                Name = name,
                UrlSlug = urlSlug
            });
        }
    }
}