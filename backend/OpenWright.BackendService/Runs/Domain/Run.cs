using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Projects.Domain;
using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;
using Revo.Domain.Entities.Attributes;
using Revo.Domain.Tenancy;

namespace OpenWright.BackendService.Runs.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "run")]
[DomainClassId("51830411-E36C-4065-96AA-9C328F9089FC")]
public class Run : TenantBasicAggregateRoot
{
    private readonly List<RunCase> cases = new();

    public Run(Guid id, Project project, DateTime startDate)
        : base(id, project.TenantId)
    {
        if (project == null)
        {
            throw new ArgumentNullException(nameof(project));
        }
        
        ProjectId = project.Id;
        StartDate = startDate;
    }
    
    protected Run()
    {
    }

    public Guid ProjectId { get; private set; }
    public DateTime StartDate { get; private set; }
    public TimeSpan? Duration { get; private set; }
    public string? Description { get; private set; }
    public int? PullRequestNumber { get; private set; }
    public CommitInfo? CommitInfo { get; private set; }
    public ActorInfo? Actor { get; private set; }

    public IReadOnlyCollection<RunCase> Cases => cases;
    
    public void UpdateDuration(TimeSpan? duration)
    {
        Duration = duration;
    }

    public void UpdateDescription(string? description)
    {
        Description = description?.NullIfWhitespaceTrimmed();
    }

    public void UpdatePullRequestNumber(int? pullRequestNumber)
    {
        PullRequestNumber = pullRequestNumber;
    }

    public void UpdateCommitInfo(CommitInfo? commitInfo)
    {
        if (!Equals(CommitInfo, commitInfo))
        {
            CommitInfo = commitInfo;
        }
    }

    public void UpdateActor(ActorInfo? actor)
    {
        if (!Equals(Actor, actor))
        {
            Actor = actor;
        }
    }
    
    public RunCase AddCase(Guid id, Case @case)
    {
        var runCase = new RunCase(id, this, @case);
        cases.Add(runCase);
        return runCase;
    }
}
