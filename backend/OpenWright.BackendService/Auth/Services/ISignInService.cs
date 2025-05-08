using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using OpenWright.Api.Auth.Dto.Payloads;

namespace OpenWright.BackendService.Auth.Services;

public interface ISignInService
{
    Task HandleCreatingOAuthTicketAsync(OAuthCreatingTicketContext context);
    Task HandleTicketReceivedAsync(TicketReceivedContext context);
    Task SignUpAsync(CreateMyUserPayload payload);
}