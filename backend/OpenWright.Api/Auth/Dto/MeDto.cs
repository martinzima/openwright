namespace OpenWright.Api.Auth.Dto;

public class MeDto
{
    public string EmailAddress { get; init; }
    public string AuthScheme { get; init; }
    
    public UserDto? User { get; init; }
    public UserRoleGrantDto[]? RoleGrants { get; init; }
}