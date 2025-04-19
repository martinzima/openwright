using Microsoft.AspNetCore.Http;
using Revo.Infrastructure.Tenancy;
using Serilog.Core;
using Serilog.Events;

namespace OpenWright.Platform.Logging;

public class TenantEnricher : ILogEventEnricher
{
    private const string TenantIdPropertyName = "TenantId";

    private readonly Func<ITenantContext> tenantContextFunc;

    public TenantEnricher()
    {
        var httpContextAccessor = new HttpContextAccessor();
        tenantContextFunc = () => httpContextAccessor.HttpContext?.RequestServices.GetService(typeof(ITenantContext)) as ITenantContext;
    }
    
    public TenantEnricher(Func<ITenantContext> tenantContextFunc)
    {
        this.tenantContextFunc = tenantContextFunc;
    }

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        var tenantContext = tenantContextFunc(); // TODO this will be slow (DI on every log event)
        if (tenantContext?.Tenant == null)
        {
            return;
        }

        var tenantId = tenantContext.Tenant.Id;
        var tenantIdProperty = propertyFactory.CreateProperty(TenantIdPropertyName, tenantId);
        logEvent.AddPropertyIfAbsent(tenantIdProperty);
    }
}