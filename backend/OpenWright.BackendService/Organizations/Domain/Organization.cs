using System.Text.RegularExpressions;
using OpenWright.BackendService.Organizations.Domain.Events;
using OpenWright.Platform.Utils;
using Revo.Core.Security;
using Revo.Core.Tenancy;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Attributes;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Organizations.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "org")]
[DomainClassId("3391586C-98B7-437A-9DE8-0FF8F57743A8")]
public class Organization : BasicAggregateRoot, ITenant
{
    public Organization(Guid id, string name, string urlSlug,
        IUser createdByUser) : base(id)
    {
        Publish(new OrganizationRegisteredEvent
        {
            OrganizationId = id
        });
        
        Rename(name);
        UpdateUrlSlug(urlSlug);
        Activate(true);
        
        CreatedByUserId = createdByUser.Id;
        CreateDate = DateTimeOffset.UtcNow;
    }
    
    protected Organization()
    {
    }
    
    public string Name { get; private set; }
    public string UrlSlug { get; private set; }
    public bool IsActive { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public DateTimeOffset CreateDate { get; private set; }
    
    public void Rename(string name)
    {
        var sanitizedName = name?.NullIfWhitespaceTrimmed()
                            ?? throw new DomainException("Organization name cannot be null or whitespace");
        
        if (sanitizedName.Length < 2 || sanitizedName.Length > 100)
        {
            throw new DomainException("Organization name must be between 2 and 100 characters long.");
        }
        
        Reconfigure(sanitizedName, IsActive, UrlSlug);
    }
    
    public void UpdateUrlSlug(string urlSlug)
    {
        var sanitizedUrlSlug = urlSlug?.NullIfWhitespaceTrimmed()
                               ?? throw new DomainException("Organization URL slug cannot be null or whitespace");
        sanitizedUrlSlug = sanitizedUrlSlug.ToLowerInvariant();

        if (!Regex.IsMatch(sanitizedUrlSlug, @"^[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$"))
        {
            throw new DomainException("Organization URL slug must only contain [a-z0-9\\-] and not start with a dash.");           
        }

        if (sanitizedUrlSlug.Length < 4
            || sanitizedUrlSlug.Length > 25)
        {
            throw new DomainException("Organization URL slug must be 4-25 characters long.");
        }
        
        Reconfigure(Name, IsActive, sanitizedUrlSlug);
    }

    public void Activate(bool isActive)
    {
        Reconfigure(Name, isActive, UrlSlug);
    }
    
    private void Reconfigure(string name, bool isActive, string urlSlug)
    {
        if (IsActive != isActive || Name != name || UrlSlug != urlSlug)
        {
            IsActive = isActive;
            Name = name;
            UrlSlug = urlSlug;

            Publish(new OrganizationReconfiguredEvent()
            {
                IsActive = isActive,
                Name = name,
                UrlSlug = urlSlug
            });
        }
    }
}