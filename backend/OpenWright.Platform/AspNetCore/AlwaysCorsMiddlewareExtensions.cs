using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace OpenWright.Platform.AspNetCore;

public static class AlwaysCorsMiddlewareExtensions
{
    /// <summary>
    /// Adds a CORS middleware to your web application pipeline to allow cross domain requests.
    /// </summary>
    /// <param name="app">The IApplicationBuilder passed to your Configure method</param>
    /// <returns>The original app parameter</returns>
    public static IApplicationBuilder UseCorsAlways(this IApplicationBuilder app)
    {
        if (app == null)
        {
            throw new ArgumentNullException(nameof(app));
        }

        return app.UseMiddleware<AlwaysCorsMiddleware>();
    }

    /// <summary>
    /// Adds a CORS middleware to your web application pipeline to allow cross domain requests.
    /// </summary>
    /// <param name="app">The IApplicationBuilder passed to your Configure method</param>
    /// <param name="policyName">The policy name of a configured policy.</param>
    /// <returns>The original app parameter</returns>
    public static IApplicationBuilder UseCorsAlways(this IApplicationBuilder app, string policyName)
    {
        if (app == null)
        {
            throw new ArgumentNullException(nameof(app));
        }

        return app.UseMiddleware<AlwaysCorsMiddleware>(policyName);
    }

    /// <summary>
    /// Adds a CORS middleware to your web application pipeline to allow cross domain requests.
    /// </summary>
    /// <param name="app">The IApplicationBuilder passed to your Configure method.</param>
    /// <param name="configurePolicy">A delegate which can use a policy builder to build a policy.</param>
    /// <returns>The original app parameter</returns>
    public static IApplicationBuilder UseCorsAlways(
        this IApplicationBuilder app,
        Action<CorsPolicyBuilder> configurePolicy)
    {
        if (app == null)
        {
            throw new ArgumentNullException(nameof(app));
        }

        if (configurePolicy == null)
        {
            throw new ArgumentNullException(nameof(configurePolicy));
        }

        var policyBuilder = new CorsPolicyBuilder();
        configurePolicy(policyBuilder);
        return app.UseMiddleware<AlwaysCorsMiddleware>(policyBuilder.Build());
    }
}