using OpenWright.Platform.Tenants;
using Revo.Core.Security;
using Revo.Core.Tenancy;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Tenants;

public class TenantContextResolver(
    IOrganizationTenantProvider tenantProvider,
    IHttpContextAccessor httpContextAccessor) :
    ITenantContextResolver
{
    public ITenant ResolveTenant()
    {
        if (httpContextAccessor.HttpContext == null)
        {
            return null;
        }

        HttpContext httpContext = httpContextAccessor.HttpContext;

        var organizationId = GetOrganizationId();
        var tenant = tenantProvider.GetTenant(organizationId);

        if (tenant != null)
        {
            /*if (httpContext?.User?.Identity != null && httpContext.User.Identity.IsAuthenticated)
            {
                var organizationIdClaims = httpContext.User.Claims.Where(x => x.Type == OpenWrightClaimTypes.OrganizationId)
                    .ToArray();
                if (!organizationIdClaims.Any(x => string.IsNullOrEmpty(x.Value) || Guid.Parse(x.Value) == tenant.Id))
                {
                    throw new AuthorizationException($"User not authorized to sign into {tenant}");
                }
            }*/
        }

        return tenant;
    }

    private Guid? GetOrganizationId()
    {
        if (httpContextAccessor.HttpContext == null)
        {
            return null;
        }

        HttpContext httpContext = httpContextAccessor.HttpContext;

        if (httpContext.Request.Headers.TryGetValue(OrganizationHttpHeaderNames.OrganizationId, out var headerOrganizationIds)
            && headerOrganizationIds.Count > 0)
        {
            var trimmedHeaderOrganizationId = headerOrganizationIds[0].Trim();
            if (trimmedHeaderOrganizationId.Length == 0)
            {
                return null;
            }

            if (headerOrganizationIds.Count > 1 || !Guid.TryParse(trimmedHeaderOrganizationId, out Guid headerOrganizationId))
            {
                throw new AuthorizationException(
                    $"Authenticated request specified an invalid {OrganizationHttpHeaderNames.OrganizationId} header");
            }

            return headerOrganizationId;
        }

        if (httpContext.Request.Query.TryGetValue("__organizationId", out var queryOrganizationIdStrings)
            && queryOrganizationIdStrings.Count == 1
            && !string.IsNullOrWhiteSpace(queryOrganizationIdStrings[0]))
        {
            if (!Guid.TryParse(queryOrganizationIdStrings[0], out Guid queryOrganizationId))
            {
                throw new AuthorizationException($"Authenticated request specified an invalid __organizationId cookie");
            }

            return queryOrganizationId;
        }

        if (httpContext.Request.Method.Equals("POST")
            && !httpContext.Request.Path.StartsWithSegments("/directory")
            && httpContext.Request.HasFormContentType
            && httpContext.Request.Form.TryGetValue(OrganizationHttpFormFieldNames.OrganizationId, out var formFieldOrganizationIds)
            && formFieldOrganizationIds.Count > 0)
        {
            var trimmedFormFieldOrganizationId = formFieldOrganizationIds[0].Trim();
            if (trimmedFormFieldOrganizationId.Length == 0)
            {
                return null;
            }

            if (formFieldOrganizationIds.Count > 1 || !Guid.TryParse(trimmedFormFieldOrganizationId, out Guid formOrganizationId))
            {
                throw new AuthorizationException(
                    $"Authenticated request specified an invalid {OrganizationHttpFormFieldNames.OrganizationId} form field");
            }

            return formOrganizationId;
        }

        if (httpContext.Request.Cookies.TryGetValue("__organizationId", out string cookieOrganizationIdString)
            && !string.IsNullOrWhiteSpace(cookieOrganizationIdString))
        {
            if (!Guid.TryParse(cookieOrganizationIdString, out Guid cookieOrganizationId))
            {
                throw new AuthorizationException($"Authenticated request specified an invalid __organizationId cookie");
            }

            return cookieOrganizationId;
        }

        return null;
    }
}