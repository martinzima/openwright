namespace OpenWright.Api.Organizations.Dto.Payloads;

public class CreateOrganizationPayload
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string UrlSlug { get; init; }
}