using OpenWright.BackendService.Organizations.Domain;
using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;

namespace OpenWright.BackendService.Projects.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "sui")]
public class Suite : OrganizationOwnedAggregateRoot
{
    private readonly List<Case> cases = new();

    public Suite(Guid id, Project project, string? title)
        : base(id, project.TenantId)
    {
        ProjectId = project?.Id ?? throw new ArgumentNullException(nameof(project));
        Rename(title);
    }
    
    public Suite(Guid id, Suite parentSuite, string? title)
        : base(id, parentSuite.TenantId)
    {
        ParentSuiteId = parentSuite?.Id ?? throw new ArgumentNullException(nameof(parentSuite));
        ProjectId = parentSuite.ProjectId;;
        Rename(title);
    }

    protected Suite()
    {
    }

    public Guid ProjectId { get; private set; }
    public Guid? ParentSuiteId { get; private set; }
    public string? Title { get; private set; }
    
    public IReadOnlyCollection<Case> Cases => cases;

    public void Rename(string? title)
    {
        Title = title?.NullIfWhitespaceTrimmed();
    }
    
    public Case AddCase(string title)
    {
        var @case = new Case(Guid.NewGuid(), this, title);
        cases.Add(@case);
        return @case;
    }
}