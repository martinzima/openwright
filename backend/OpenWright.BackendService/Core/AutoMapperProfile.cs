using AutoMapper;
using OpenWright.Api.Auth.Dto;
using OpenWright.Api.Organizations.Dto;
using OpenWright.BackendService.Auth.Reads.Model;
using OpenWright.BackendService.Organizations.Reads.Model;

namespace OpenWright.BackendService.Core;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<UserView, UserDto>();
        CreateMap<UserView, MeDto>();
        CreateMap<UserRoleGrantView, UserRoleGrantDto>();
        
        CreateMap<OrganizationView, OrganizationDto>();
    }
}