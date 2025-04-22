using OpenWright.Api.Projects.ValueObjects;
using OpenWright.Platform.Utils;
using Revo.DataAccess.Entities;
using Revo.Domain.Core;
using Revo.Domain.Entities.Basic;

namespace OpenWright.BackendService.Projects.Domain;

[TablePrefix(NamespacePrefix = "ow", ColumnPrefix = "cas")]
public class Case : BasicEntity
{
    private readonly List<string> tags = new();
    private readonly List<Annotation> annotations = new();

    public Case(Guid id, Suite suite, string title)
        : base(id)
    {
        Title = title;
        Suite = suite;
    }
    
    protected Case()
    {
    }

    public Suite Suite { get; private set; }
    public string Title { get; private set; }
    public Guid? SpecFileId { get; private set; }
    public FileLocation? FileLocation { get; private set; }
    public IReadOnlyCollection<string> Tags => tags;
    public IReadOnlyCollection<Annotation> Annotations => annotations;

    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
        {
            return;
        }

        if (!tags.Contains(tag))
        {
            tags.Add(tag);
        }
    }

    public void AddAnnotation(Annotation annotation)
    {
        annotations.Add(annotation ?? throw new ArgumentNullException(nameof(annotation)));
    }

    public void UpdateTitle(string title)
    {
        Title = title?.NullIfWhitespaceTrimmed()
            ?? throw new DomainException($"Case title cannot be null or whitespace");
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
}