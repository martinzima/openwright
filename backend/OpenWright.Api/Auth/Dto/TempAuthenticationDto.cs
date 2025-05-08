namespace OpenWright.Api.Auth.Dto;

public class TempAuthenticationDto
{
    public string EmailAddress { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}