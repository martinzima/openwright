using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;

namespace OpenWright.BackendService.Auth.Services;

public interface ISignInService
{
    Task HandleCreatingOAuthTicketAsync(OAuthCreatingTicketContext context);
    Task HandleTicketReceivedAsync(TicketReceivedContext context);
}