namespace OpenWright.Api.Auth.Dto.Payloads;

public class CreateMyUserPayload
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
}