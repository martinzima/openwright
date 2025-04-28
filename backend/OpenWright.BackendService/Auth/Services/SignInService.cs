using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using OpenWright.BackendService.Auth.Domain;
using OpenWright.Platform.Security;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Auth.Services;

public class SignInService(IRepository repository) : ISignInService
{
    public async Task HandleCreatingOAuthTicketAsync(OAuthCreatingTicketContext context)
    {
        var emailAddress = context.Principal?.FindFirstValue(ClaimTypes.Email);

        if (emailAddress == null)
        {
            context.Fail("Principal email is null");
            context.Properties.RedirectUri = "/login?error=internal_error";
            return;
        }
        
        var provider = context.Scheme.Name;
        switch (provider)
        {
            case GoogleDefaults.AuthenticationScheme:
                await HandleGoogleSignInAsync(context);
                break;
            
            default:
                context.Fail($"Unknown OAuth provider: {provider}");
                context.Properties.RedirectUri = "/login?error=internal_error";
                return;
        }
        
        var user = await repository.Where<User>(x => x.EmailAddress.ToLower() == emailAddress.ToLower())
            .FirstOrDefaultAsync(repository.GetQueryableResolver<User>());
        if (user != null)
        {
            context.Principal = await CreateClaimsPrincipalAsync(user);
        }
    }

    public Task HandleTicketReceivedAsync(TicketReceivedContext context)
    {
        throw new NotImplementedException();
    }

    public async Task SignUpAsync(string email)
    {
        
    }

    private async Task<ClaimsPrincipal> CreateClaimsPrincipalAsync(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.EmailAddress),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        };

        foreach (var roleGrant in user.RoleGrants)
        {
            claims.Add(new Claim(OpenWrightClaimTypes.Role, new RoleClaim
            {
                Role = roleGrant.Role.ToString(),
                OrganizationId = roleGrant.OrganizationId
            }.SerializeClaim()));
        }
        
        var identity = new ClaimsIdentity(claims, AuthenticationConsts.AuthenticationScheme);
        return new ClaimsPrincipal(identity);
    }

    private async Task HandleGoogleSignInAsync(OAuthCreatingTicketContext context)
    {
        var emailVerified = context.User.GetProperty("email_verified").GetBoolean();
        if (!emailVerified)
        {
            context.Fail("Google email not verified");
            context.Properties.RedirectUri = "/login?error=email_not_verified";
            return;
        }
    }
}