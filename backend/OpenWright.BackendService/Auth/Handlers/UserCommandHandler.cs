using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Google;
using OpenWright.BackendService.Auth.Commands;
using OpenWright.BackendService.Auth.Domain;
using Revo.Core.Commands;
using Revo.Core.Security;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Auth.Handlers;

public class UserCommandHandler(IRepository repository,
    IUserContext userContext,
    IHttpContextAccessor httpContextAccessor) :
    ICommandHandler<CreateMyUserCommand>
{
    public Task HandleAsync(CreateMyUserCommand command, CancellationToken cancellationToken)
    {
        if (userContext.IsAuthenticated)
        {
            throw new InvalidOperationException("Cannot sign up because the request already has a user");
        }

        if (httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated != true)
        {
            throw new InvalidOperationException("Cannot sign up because the request has no authentication data");
        }

        string emailAddress;
        
        switch (httpContextAccessor.HttpContext.User.Identity.AuthenticationType)
        {
            case GoogleDefaults.AuthenticationScheme:
                emailAddress = httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Email)
                               ?? throw new InvalidOperationException("Invalid Google user authenticated");
                break;
            
            default:
                throw new InvalidOperationException("Unknown authentication scheme for sign up: "
                                                    + httpContextAccessor.HttpContext.User.Identity.AuthenticationType);
        }
        
        var user = new User(Guid.NewGuid(), new EmailAddress(emailAddress));
        repository.Add(user);
        
        return Task.CompletedTask;
    }
}