using OpenWright.BackendService.Organizations.Domain;
using Revo.Domain.ReadModel;

namespace OpenWright.BackendService.Organizations.Reads.Model;

[ReadModelForEntity(typeof(Organization))]
public class OrganizationView : EntityView
{
    public string Name { get; set; }
    public string UrlSlug { get; set; }
    public bool IsActive { get; set; }
}