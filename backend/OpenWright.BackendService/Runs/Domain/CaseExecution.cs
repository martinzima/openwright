using OpenWright.Api.Runs.ValueObjects;
using Revo.DataAccess.Entities;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Runs.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "cex")]
public class CaseExecution : BasicEntity
{
    private readonly List<string> stdout = new();
    private readonly List<string> stderr = new();
    private readonly List<TestError> errors = new();

    public CaseExecution(Guid id, RunCase runCase, DateTime startDate)
        : base(id)
    {
        RunCase = runCase ?? throw new ArgumentNullException(nameof(runCase));
        StartDate = startDate;
    }

    protected CaseExecution()
    {
    }

    public RunCase RunCase { get; private set; }
    public DateTime StartDate { get; private set; }
    public TimeSpan? Duration { get; private set; }
    public int? Retry { get; private set; }
    public TestStatus? Status { get; private set; }
    public IReadOnlyCollection<TestError> Errors => errors;
    public IReadOnlyCollection<string> Stdout => stdout;
    public IReadOnlyCollection<string> Stderr => stderr;

    public void UpdateDuration(TimeSpan? duration)
    {
        Duration = duration;
    }

    public void UpdateRetry(int? retry)
    {
        Retry = retry;
    }

    public void UpdateStatus(TestStatus? status)
    {
        Status = status;
    }

    public void AddError(TestError error)
    {
        errors.Add(error ?? throw new ArgumentNullException(nameof(error)));
    }
    
    public void AddStdout(string line)
    {
        stdout.Add(line ?? throw new ArgumentNullException(nameof(line)));
    }

    public void AddStderr(string line)
    {
        stderr.Add(line ?? throw new ArgumentNullException(nameof(line)));
    }
}
