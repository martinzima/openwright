using OpenWright.BackendService.Organizations.Domain;
using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;

namespace OpenWright.BackendService.Projects.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "sui")]
public class Suite : OrganizationOwnedAggregateRoot
{
    private readonly List<Case> cases = new();
    private readonly List<Suite> suites = new();

    public Suite(Guid id, Project project, string? title)
        : base(id, project.TenantId)
    {
        ProjectId = project?.Id ?? throw new ArgumentNullException(nameof(project));
        Rename(title);
    }
    
    protected Suite(Guid id, Suite parentSuite, string? title)
        : base(id, parentSuite.TenantId)
    {
        ParentSuite = parentSuite ?? throw new ArgumentNullException(nameof(parentSuite));
        ProjectId = parentSuite.ProjectId;;
        Rename(title);
    }

    protected Suite()
    {
    }

    public Guid ProjectId { get; private set; }
    public Suite? ParentSuite { get; private set; }
    public string? Title { get; private set; }
    public string? RunGroup { get; private set; }
    
    public IReadOnlyCollection<Case> Cases => cases;
    public IReadOnlyCollection<Suite> Suites => suites;

    public void Rename(string? title)
    {
        Title = title?.NullIfWhitespaceTrimmed();
    }

    public void UpdateRunGroup(string? runGroup)
    {
        RunGroup = runGroup;
    }
    
    public void AddCase(string title)
    {
        var @case = new Case(Guid.NewGuid(), this, title);
        cases.Add(@case);
    }

    public void AddSuite(string? title)
    {
        var suite = new Suite(Guid.NewGuid(), this, title);
        suites.Add(suite);
    }
}