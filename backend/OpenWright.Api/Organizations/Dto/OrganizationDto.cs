namespace OpenWright.Api.Organizations.Dto;

public class OrganizationDto
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string UrlSlug { get; init; }
    public bool IsActive { get; init; }
}