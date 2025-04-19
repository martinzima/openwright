using OpenWright.BackendService.Organizations.Domain;

namespace OpenWright.BackendService.Tenants;

public interface IOrganizationManager
{
    Task<Organization[]> GetActiveOrganizationsAsync();
    Task<Organization[]> GetAllOrganizationsAsync();
    Task<Organization> GetOrganizationAsync(Guid id);
}