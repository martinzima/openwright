using OpenWright.Api.Projects.ValueObjects;
using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Projects.Domain;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Runs.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "rca")]
public class RunCase : BasicEntity
{
    private readonly List<Annotation> annotations = new();

    public RunCase(Guid id, Run run, Case @case)
        : base(id)
    {
        Run = run ?? throw new ArgumentNullException(nameof(run));
        CaseId = @case?.Id ?? throw new ArgumentNullException(nameof(@case));
    }
    
    protected RunCase()
    {
    }

    public Run Run { get; private set; }
    public Guid CaseId { get; private set; }
    public Guid? SpecFileId { get; private set; }
    public FileLocation? FileLocation { get; private set; }
    public int? Timeout { get; private set; }
    public int? Retries { get; private set; }
    public TestStatus? ExpectedStatus { get; private set; }

    public IReadOnlyCollection<Annotation> Annotations => annotations;

    public void UpdateTimeout(int? timeout)
    {
        Timeout = timeout;
    }

    public void UpdateRetries(int? retries)
    {
        Retries = retries;
    }

    public void UpdateExpectedStatus(TestStatus? status)
    {
        ExpectedStatus = status;
    }

    public void UpdateLocation(SpecFile? specFile, FileLocation? fileLocation)
    {
        if (SpecFileId != specFile?.Id || !Equals(FileLocation, fileLocation))
        {
            if (specFile == null && FileLocation != null)
            {
                throw new DomainException($"FileLocation cannot be set when SpecFile is null");
            }
            
            SpecFileId = specFile?.Id;
            FileLocation = fileLocation;   
        }
    }

    public void AddAnnotation(Annotation annotation)
    {
        annotations.Add(annotation ?? throw new ArgumentNullException(nameof(annotation)));
    }
}