using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using OpenWright.Api.Auth.Dto;
using OpenWright.BackendService.Auth.Reads.Model;
using OpenWright.BackendService.Auth.Reads.Queries;
using OpenWright.Platform.Security;
using Revo.Core.Commands;
using Revo.Core.Security;
using Revo.DataAccess.Entities;

namespace OpenWright.BackendService.Auth.Reads.Handlers;

public class MeQueryHandler(IUserContext userContext,
    IReadRepository readRepository,
    IHttpContextAccessor httpContextAccessor,
    IMapper mapper) : IQueryHandler<GetMeQuery, MeDto>
{
    public async Task<MeDto> HandleAsync(GetMeQuery query, CancellationToken cancellationToken)
    {
        if (userContext.IsAuthenticated)
        {
            var user = await readRepository.FindAll<UserView>()
                .Include(x => x.RoleGrants)
                .ThenInclude(x => x.Organization)
                .GetByIdAsync(readRepository, userContext.UserId!.Value, cancellationToken);
            return new MeDto()
            {
                User = mapper.Map<UserDto>(user),
                AuthScheme = AuthenticationConsts.AuthenticationScheme,
                RoleGrants = mapper.Map<UserRoleGrantDto[]>(user.RoleGrants)
            };
        }

        if (httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true)
        {
            var httpContextUser = httpContextAccessor.HttpContext.User;
            
            switch (httpContextAccessor.HttpContext.User.Identity.AuthenticationType)
            {
                case GoogleDefaults.AuthenticationScheme:
                    return new MeDto
                    {
                        AuthScheme = GoogleDefaults.AuthenticationScheme,
                        TempAuthentication = new TempAuthenticationDto()
                        {
                            EmailAddress = httpContextUser.FindFirstValue(ClaimTypes.Email)
                                           ?? throw new InvalidOperationException("Invalid Google user authenticated"),
                            FirstName = httpContextUser.FindFirstValue(ClaimTypes.GivenName),
                            LastName = httpContextUser.FindFirstValue(ClaimTypes.Surname)
                        }
                    };
            }
        }
        
        throw new AuthorizationException("Not authenticated");
    }
}