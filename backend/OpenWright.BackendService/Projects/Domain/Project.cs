using OpenWright.Platform.Utils;
using Revo.Core.Tenancy;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Attributes;
using Revo.Domain.Tenancy;

namespace OpenWright.BackendService.Projects.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "pro")]
[DomainClassId("54EC01B8-2320-4599-BD89-D3421EBC1C3C")]
public class Project : TenantBasicAggregateRoot
{
    public Project(Guid id, ITenant tenant, string name) : base(id, tenant)
    {
        Rename(name);
    }

    private Project()
    {
    }
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    
    public void Rename(string name)
    {
        Name = name?.NullIfWhitespaceTrimmed()
            ?? throw new DomainException("Project name cannot be null or empty");
    }
    
    public void UpdateDescription(string? description)
    {
        Description = description?.NullIfWhitespaceTrimmed();
    }
}