using Microsoft.AspNetCore.Mvc;
using OpenWright.Api.Organizations.Dto.Payloads;
using OpenWright.BackendService.Auth.Commands;
using OpenWright.BackendService.Organizations.Reads.Queries;
using Revo.AspNetCore.Web;

namespace OpenWright.BackendService.Organizations.Api;

[Route("api/organizations")]
public class OrganizationsController : CommandApiController
{
    [HttpGet("url-slugs/{urlSlug}")]
    public Task<bool> CheckIsOrganizationUrlSlugAvailable([FromRoute] string urlSlug)
    {
        return CommandGateway.SendAsync(new CheckIsOrganizationUrlSlugAvailableQuery
        {
            UrlSlug = urlSlug
        });
    }
    
    [HttpPost]
    public Task PostUser([FromBody] CreateOrganizationPayload payload)
    {
        return CommandGateway.SendAsync(new CreateOrganizationCommand() { Payload = payload });
    }
}