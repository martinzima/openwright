using Microsoft.AspNetCore.Http;
using Serilog.Core;
using Serilog.Events;

namespace OpenWright.Platform.Logging;

public class HttpContextEnricher : ILogEventEnricher
{
    private const string UserIdPropertyName = "UserId";
    private const string RemoteIpPropertyName = "RemoteIp";
    
    private readonly IHttpContextAccessor httpContextAccessor;

    public HttpContextEnricher() : this(new HttpContextAccessor())
    {
    }
    
    public HttpContextEnricher(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        /*var userId = httpContext.User.Identity?.TryGetSubjectId();
        if (!string.IsNullOrEmpty(userId))
        {
            var userIdProperty = propertyFactory.CreateProperty(UserIdPropertyName, userId);
            logEvent.AddPropertyIfAbsent(userIdProperty);
        }*/

        var remoteIp = httpContext.Connection?.RemoteIpAddress;
        if (remoteIp != null)
        {
            var remoteIpProperty = propertyFactory.CreateProperty(RemoteIpPropertyName, remoteIp.ToString());
            logEvent.AddPropertyIfAbsent(remoteIpProperty);
        }
    }
}