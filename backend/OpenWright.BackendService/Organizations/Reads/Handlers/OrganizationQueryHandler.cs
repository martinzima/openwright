using OpenWright.BackendService.Organizations.Reads.Model;
using OpenWright.BackendService.Organizations.Reads.Queries;
using Revo.Core.Commands;
using Revo.DataAccess.Entities;

namespace OpenWright.BackendService.Organizations.Reads.Handlers;

public class OrganizationQueryHandler(IReadRepository readRepository) :
    IQueryHandler<CheckIsOrganizationUrlSlugAvailableQuery, bool>
{
    public async Task<bool> HandleAsync(CheckIsOrganizationUrlSlugAvailableQuery query, CancellationToken cancellationToken)
    {
        return await readRepository.Where<OrganizationView>(x => x.UrlSlug.ToLower() == query.UrlSlug.ToLower())
                .AnyAsync(readRepository, cancellationToken);
    }
}