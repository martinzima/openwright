using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace OpenWright.Platform.AspNetCore;

public static class CsrfProtectionMiddleware
{
    public const string CsrfHeaderName = "OpenWright-Csrf-Token";
    
    private static readonly HashSet<string> CsrfProtectedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST", "PUT", "PATCH", "DELETE"
    };

    public static IApplicationBuilder UseSimpleCsrfProtection(this IApplicationBuilder app, string headerName = CsrfHeaderName)
    {
        return app.Use(async (context, next) =>
        {
            var logger = context.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger(nameof(CsrfProtectionMiddleware));
            
            var endpoint = context.GetEndpoint();

            var skipCsrf = endpoint?.Metadata.GetMetadata<IgnoreAntiforgeryTokenAttribute>() != null;

            if (!skipCsrf && CsrfProtectedMethods.Contains(context.Request.Method))
            {
                if (!context.Request.Headers.ContainsKey(headerName))
                {
                    logger.LogError("CSRF header missing on {Method} {Path}", context.Request.Method, context.Request.Path);
                    
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Missing CSRF header");
                    return;
                }
            }

            await next();
        });
    }
}