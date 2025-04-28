namespace OpenWright.Api.Auth.Dto;

public class UserDto
{
    public Guid Id { get; init; }
    public string EmailAddress { get; init; }
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
}