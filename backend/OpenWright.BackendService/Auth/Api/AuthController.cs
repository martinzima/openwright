using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using OpenWright.Platform.Security;

namespace OpenWright.BackendService.Auth.Api;

[Route("api/auth")]
public class AuthController : Controller
{
    private static readonly string[] schemes = new[]
    {
        GoogleDefaults.AuthenticationScheme,
        //MicrosoftAccountDefaults.AuthenticationScheme
    };

    [HttpGet("login/{provider}")]
    public IActionResult Login(
        [FromRoute] string provider,
        [FromQuery] string returnUrl = "/")
    {
        var providerScheme = schemes.FirstOrDefault(x => x.Equals(provider, StringComparison.OrdinalIgnoreCase));
        if (providerScheme == null)
        {
            return BadRequest($"Unknown provider: {provider}");
        }

        if (!Url.IsLocalUrl(returnUrl))
        {
            return BadRequest("Invalid returnUrl");
        }
        
        var props = new AuthenticationProperties
        {
            RedirectUri = returnUrl
        };
        return Challenge(props, providerScheme);
    }

    [HttpPost("logout")]
    public async Task Logout()
    {
        await HttpContext.SignOutAsync();
    }
}