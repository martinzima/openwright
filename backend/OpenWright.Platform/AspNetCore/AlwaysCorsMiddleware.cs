using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace OpenWright.Platform.AspNetCore;

/// <summary>
/// Same functionality as original CorsMiddleware, but adding headers even when UseDeveloperExceptionPage is active.
/// </summary>
public class AlwaysCorsMiddleware
{
    private readonly RequestDelegate next;
    private readonly ICorsService corsService;
    private readonly ICorsPolicyProvider corsPolicyProvider;
    private readonly CorsPolicy policy;
    private readonly string corsPolicyName;

    /// <summary>
    /// Instantiates a new <see cref="CorsMiddleware"/>.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="corsService">An instance of <see cref="ICorsService"/>.</param>
    /// <param name="policyProvider">A policy provider which can get an <see cref="CorsPolicy"/>.</param>
    public AlwaysCorsMiddleware(
        RequestDelegate next,
        ICorsService corsService,
        ICorsPolicyProvider policyProvider)
        : this(next, corsService, policyProvider, policyName: null)
    {
    }

    /// <summary>
    /// Instantiates a new <see cref="CorsMiddleware"/>.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="corsService">An instance of <see cref="ICorsService"/>.</param>
    /// <param name="policyProvider">A policy provider which can get an <see cref="CorsPolicy"/>.</param>
    /// <param name="policyName">An optional name of the policy to be fetched.</param>
    public AlwaysCorsMiddleware(
        RequestDelegate next,
        ICorsService corsService,
        ICorsPolicyProvider policyProvider,
        string policyName)
    {
        if (next == null)
        {
            throw new ArgumentNullException(nameof(next));
        }

        if (corsService == null)
        {
            throw new ArgumentNullException(nameof(corsService));
        }

        if (policyProvider == null)
        {
            throw new ArgumentNullException(nameof(policyProvider));
        }

        this.next = next;
        this.corsService = corsService;
        corsPolicyProvider = policyProvider;
        corsPolicyName = policyName;
    }

    /// <summary>
    /// Instantiates a new <see cref="CorsMiddleware"/>.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="corsService">An instance of <see cref="ICorsService"/>.</param>
    /// <param name="policy">An instance of the <see cref="CorsPolicy"/> which can be applied.</param>
    public AlwaysCorsMiddleware(
        RequestDelegate next,
        ICorsService corsService,
        CorsPolicy policy)
    {
        if (next == null)
        {
            throw new ArgumentNullException(nameof(next));
        }

        if (corsService == null)
        {
            throw new ArgumentNullException(nameof(corsService));
        }

        if (policy == null)
        {
            throw new ArgumentNullException(nameof(policy));
        }

        this.next = next;
        this.corsService = corsService;
        this.policy = policy;
    }

    /// <inheritdoc />
    public Task Invoke(HttpContext context)
    {
        if (!context.Response.HasStarted)
        {
            context.Response.OnStarting(async state =>
            {
                var httpContext = (HttpContext) state;
                if (httpContext.Request.Headers.ContainsKey(CorsConstants.Origin))
                {
                    var corsPolicy = policy ?? await corsPolicyProvider?.GetPolicyAsync(context, corsPolicyName);
                    if (corsPolicy != null)
                    {
                        var corsResult = corsService.EvaluatePolicy(context, corsPolicy);
                        corsService.ApplyResult(corsResult, context.Response);

                        var accessControlRequestMethod =
                            context.Request.Headers[CorsConstants.AccessControlRequestMethod];
                        if (string.Equals(
                                context.Request.Method,
                                CorsConstants.PreflightHttpMethod,
                                StringComparison.OrdinalIgnoreCase) &&
                            !StringValues.IsNullOrEmpty(accessControlRequestMethod))
                        {
                            // Since there is a policy which was identified,
                            // always respond to preflight requests.
                            context.Response.StatusCode = StatusCodes.Status204NoContent;
                            return;
                        }
                    }
                }
            }, context);
        }

        return next(context);
    }
}