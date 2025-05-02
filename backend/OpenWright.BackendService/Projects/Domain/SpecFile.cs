using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Attributes;
using Revo.Domain.Tenancy;

namespace OpenWright.BackendService.Projects.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "spf")]
[DomainClassId("3A6BE28C-6DE5-42F4-A18A-9FBE9B25AF25")]
public class SpecFile : TenantBasicAggregateRoot
{
    public SpecFile(Guid id, Project project, string name) : base(id, project.TenantId)
    {
        ProjectId = project.Id;
        Move(name);
    }

    protected SpecFile()
    {
    }
    
    public string Name { get; private set; }
    public string Path { get; private set; }
    public Guid ProjectId { get; private set; }
    
    public void Move(string path)
    {
        Path = path?.NullIfWhitespaceTrimmed()?.Replace('\\', '/')
            ?? throw new DomainException("Spec file path cannot be null or empty");
        Name = Path.Split('/').Last();
    }
}