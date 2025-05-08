using Microsoft.AspNetCore.Mvc;
using Ninject;
using OpenWright.Api.Auth.Dto;
using OpenWright.Api.Auth.Dto.Payloads;
using OpenWright.BackendService.Auth.Reads.Queries;
using OpenWright.BackendService.Auth.Services;
using Revo.AspNetCore.Web;

namespace OpenWright.BackendService.Auth.Api;

[Route("api/me")]
public class MeController : CommandApiController
{
    [Inject]
    public ISignInService SignInService { get; set; }
    
    [HttpGet]
    public Task<MeDto> Get()
    {
        return CommandGateway.SendAsync(new GetMeQuery());
    }

    [HttpPost("user")]
    public async Task PostUser([FromBody] CreateMyUserPayload payload)
    {
        await SignInService.SignUpAsync(payload);
    }
}