using OpenWright.Api.Auth.Domain;
using OpenWright.Api.Organizations.Dto;

namespace OpenWright.Api.Auth.Dto;

public class UserRoleGrantDto
{
    public Guid Id { get; init; }
    public UserRole UserRole { get; init; }
    public OrganizationDto Organization { get; private set; }
}