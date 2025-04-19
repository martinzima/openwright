using Microsoft.AspNetCore.Mvc;
using OpenWright.Platform.Core;

namespace OpenWright.BackendService.Core.Controllers;

[Route("")]
[ApiController]
public class HomeController : ControllerBase
{
    public string Get()
    {
        return $"Hello. {GetType().Assembly.GetName().Name} v{BuildVersionResolver.GetBuildVersion()}";
    }
}