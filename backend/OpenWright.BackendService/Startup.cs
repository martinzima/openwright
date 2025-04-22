using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using MoreLinq;
using OpenWright.Api.Runs.ValueObjects;
using OpenWright.Platform.AspNetCore;
using OpenWright.Platform.PostgreSql;
using Revo.AspNetCore;
using Revo.AspNetCore.Configuration;
using Revo.Core.Configuration;
using Revo.EFCore.Configuration;
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

        services.AddMvc()
            .AddJsonOptions(opts =>
            {
                var enumConverter = new JsonStringEnumConverter();
                opts.JsonSerializerOptions.Converters.Add(enumConverter);
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
            .UseEFCoreWithNpgsqlFromAppSettings(Configuration,
                Kernel,
                contextBuilder => { },
                builder => builder.MapEnum<TestStatus>("ow_test_status"))
            .UseAllEFCoreInfrastructure()
            .UseAspNetCore();
    }
}