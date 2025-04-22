using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Runs.Domain;
using Revo.Domain.ReadModel;
using Revo.Domain.Tenancy;

namespace OpenWright.BackendService.Runs.Reads.Model;

[ReadModelForEntity(typeof(Run))]
public class RunView : TenantEntityView
{
    public Guid ProjectId { get; private set; }
    public DateTime StartDate { get; private set; }
    public TimeSpan? Duration { get; private set; }
    public string? Description { get; private set; }
    public int? PullRequestNumber { get; private set; }
    public CommitInfo? CommitInfo { get; private set; }
    public ActorInfo? Actor { get; private set; }
}