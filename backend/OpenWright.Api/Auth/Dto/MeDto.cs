namespace OpenWright.Api.Auth.Dto;

public class MeDto
{
    public string AuthScheme { get; init; }
    
    public UserDto? User { get; init; }
    public TempAuthenticationDto? TempAuthentication { get; init; }
    public UserRoleGrantDto[]? RoleGrants { get; init; }
}