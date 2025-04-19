using Revo.Infrastructure.Tenancy;

namespace OpenWright.Platform.Core;

public class CustomTenantContext : DefaultTenantContext
{
    public CustomTenantContext(ITenantContextResolver tenantContextResolver)
        : base(tenantContextResolver)
    {
        SentrySdk.ConfigureScope(scope =>
        {
            scope.SetTag("tenant_id", Tenant?.Id.ToString());
            scope.SetTag("tenant_name", Tenant?.Name);
        });
    }
}