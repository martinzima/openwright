using Revo.Core.Commands;
using Revo.Infrastructure.Security.Commands;

namespace OpenWright.BackendService.Organizations.Reads.Queries;

[Authenticated]
public class CheckIsOrganizationUrlSlugAvailableQuery : IQuery<bool>
{
    public required string UrlSlug { get; init; }
}