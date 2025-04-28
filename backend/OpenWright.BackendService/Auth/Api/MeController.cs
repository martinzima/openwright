using Microsoft.AspNetCore.Mvc;
using OpenWright.Api.Auth.Dto;
using OpenWright.Api.Auth.Dto.Payloads;
using OpenWright.BackendService.Auth.Commands;
using OpenWright.BackendService.Auth.Reads.Queries;
using Revo.AspNetCore.Web;

namespace OpenWright.BackendService.Auth.Api;

[Route("api/me")]
public class MeController : CommandApiController
{
    [HttpGet]
    public Task<MeDto> Get()
    {
        return CommandGateway.SendAsync(new GetMeQuery());
    }

    [HttpPost("user")]
    public Task PostUser([FromBody] CreateMyUserPayload payload)
    {
        return CommandGateway.SendAsync(new CreateMyUserCommand() {Payload = payload});
    }
}