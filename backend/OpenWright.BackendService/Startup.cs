using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using MoreLinq;
using OpenWright.Api.Auth.Domain;
using OpenWright.Api.Runs.ValueObjects;
using OpenWright.BackendService.Auth.Domain;
using OpenWright.BackendService.Auth.Services;
using OpenWright.Common.Json;
using OpenWright.Platform.AspNetCore;
using OpenWright.Platform.PostgreSql;
using Revo.AspNetCore;
using Revo.AspNetCore.Configuration;
using Revo.Core.Configuration;
using Revo.EFCore.Configuration;
using Revo.Extensions.AutoMapper.Configuration;
using Revo.Infrastructure;
using Revo.Infrastructure.Events.Async;

namespace OpenWright.BackendService;

public class Startup : RevoStartup
{
    public Startup(IConfiguration configuration, ILoggerFactory loggerFactory) : base(configuration, loggerFactory)
    {
    }

    public override void ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);

        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
                options.SlidingExpiration = true;
            })
            .AddGoogle(options =>
            {
                var clientId = Configuration["Authentication:Google:ClientId"]
                    ?? throw new ArgumentNullException("Missing Authentication:Google:ClientId in appsettings.json.");;
                var clientSecret = Configuration["Authentication:Google:ClientSecret"]
                    ?? throw new ArgumentNullException("Missing Authentication:Google:ClientSecret in appsettings.json.");

                options.ClientId = clientId;
                options.ClientSecret = clientSecret;
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.CallbackPath = "/api/signin-google-callback";
                
                options.Events = new OAuthEvents
                {
                    OnCreatingTicket = async ctx =>
                    {
                        var signInService = ctx.HttpContext.RequestServices.GetRequiredService<ISignInService>();
                        await signInService.HandleCreatingOAuthTicketAsync(ctx);
                    },
                    OnTicketReceived = async ctx =>
                    {
                        var signInService = ctx.HttpContext.RequestServices.GetRequiredService<ISignInService>();
                        await signInService.HandleTicketReceivedAsync(ctx);
                    }
                };
                
                options.Scope.Add("email");
                options.Scope.Add("profile");
            });
        
        services.AddMvc()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.Converters.Add(new OptionalConverterFactory());
            })
            .ConfigureApplicationPartManager(partMgr =>
                AppDomain.CurrentDomain.GetAssemblies()
                    .Select(x => new AssemblyPart(x))
                    .ForEach(partMgr.ApplicationParts.Add));
    }

    public override void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        base.Configure(app, env);

        app.UseEnDoExceptionHandler();

        if (!env.IsDevelopment())
        {
            app.UseHsts();
        }
        
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
        });

        app.UseAuthentication();

        app.UseCorsAlways(builder =>
            builder
                .WithOrigins(Configuration.GetSection("CorsOrigins").GetChildren().Select(x => x.Value).ToArray())
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();

            //endpoints.Count().Filter().OrderBy().Expand().Select().MaxTop(null);
            //endpoints.EnableDependencyInjection();
        });
    }

    protected override IRevoConfiguration CreateRevoConfiguration()
    {
        bool? applyMigrationsUponStartup = Configuration.GetValue<bool?>("Deployment:ApplyMigrationsUponStartup");

        return new RevoConfiguration()
            .ConfigureCore(cfg =>
            {
                //cfg.Security.UseNullSecurityModule = false;
            })
            .ConfigureInfrastructure(cfg =>
            {
                cfg.EnableSagas = false;
                cfg.AsyncEventPipeline = new AsyncEventPipelineConfiguration()
                {
                    CatchUpProcessingParallelism = 10,
                    SyncQueueProcessingParallelism = 3
                };

                cfg.DatabaseMigrations.ApplyMigrationsUponStartup = applyMigrationsUponStartup;
                cfg.Tenancy.UseNullTenantContextResolver = false;
            })
            .UseAspNetCore()
            .AddAutoMapperExtension()
            .UseEFCoreWithNpgsqlFromAppSettings(Configuration,
                Kernel,
                contextBuilder => { },
                builder => builder
                    .MapEnum<TestStatus>("ow_test_status")
                    .MapEnum<UserRole>("ow_user_role"))
            .UseAllEFCoreInfrastructure()
            .UseAspNetCore();
    }
}