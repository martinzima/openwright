using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using OpenWright.Platform.Sentry;
using OpenWright.Platform.Tenants;
using OpenWright.Platform.Utils;
using Serilog;
using Serilog.Enrichers.Span;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Exceptions.Core;
using Serilog.Exceptions.EntityFrameworkCore.Destructurers;

namespace OpenWright.Platform.Logging;

public static class LoggingHelpers
{
    public static void ConfigureBootstrapSerilog()
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.NullIfEmpty()
                          ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")?.NullIfEmpty()
                          ?? "Production";

        var bootstrapLogBuilder = new LoggerConfiguration()
            .ConfigureDefaultEnrichers()
            .ConfigureDefaultLoggerLevels();

        if (environment == "Development")
        {
            bootstrapLogBuilder = bootstrapLogBuilder
                .ConfigureDefaultDevelopmentLogger();
        }
        else
        {
            bootstrapLogBuilder = bootstrapLogBuilder
                .ConfigureDefaultProductionLogger();
        }

        /*if (environment == "IntegrationTest")
        {
            Log.Logger = bootstrapLogBuilder
                .CreateBootstrapLogger();
        }
        else
        {*/
            Log.Logger = bootstrapLogBuilder
                .CreateLogger();
        //}
    }

    public static void ConfigureSerilog(this WebApplicationBuilder builder,
        Func<LoggerConfiguration, LoggerConfiguration> loggerConfiguration = null)
    {
        builder.Host.UseSerilog((context, services, configuration) =>
            {
                configuration
                    .ConfigureDefaultLoggerLevels()
                    .ConfigureDefaultEnrichers()
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services);

                if (!context.Configuration.GetSection("Serilog:WriteTo").Exists())
                {
                    if (context.HostingEnvironment.IsDevelopment()
                        /*|| context.HostingEnvironment.EnvironmentName == "IntegrationTest"*/)
                    {
                        configuration.ConfigureDefaultDevelopmentLogger();
                    }
                    else
                    {
                        configuration.ConfigureDefaultProductionLogger();
                    }
                }
                
                loggerConfiguration?.Invoke(configuration);
            }
        );   
    }

    public static IApplicationBuilder UseCustomSerilogRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseSerilogRequestLogging(options =>
        {
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent);
            };
        });
    }

    private static LoggerConfiguration ConfigureDefaultLoggerLevels(this LoggerConfiguration configuration)
    {
        return configuration
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Debug)
            .Filter
            .ByExcluding(logEvent =>
            {
                // log only Executed DbCommand messages from debug level
                if (logEvent.Properties.TryGetValue("SourceContext", out var sourceContext)
                    && ((sourceContext as ScalarValue)?.Value as string) == "Microsoft.EntityFrameworkCore.Database.Command"
                    && logEvent.Properties.TryGetValue("EventId", out var eventId)
                    && eventId is StructureValue
                    && !((StructureValue) eventId).Properties.Any(p => p.Name == "Id"
                                                                      && ((p.Value as ScalarValue)?.Value as int?) == RelationalEventId.CommandExecuted.Id))
                {
                    return true;
                }

                return false;
            });
    }
    
    private static LoggerConfiguration ConfigureDefaultEnrichers(this LoggerConfiguration configuration)
    {
        return configuration
            .Enrich.FromLogContext()
            .Enrich.WithSpan()
            .Enrich.With<HttpContextEnricher>()
            .Enrich.WithRequestHeader(OrganizationHttpHeaderNames.OrganizationId, "OrganizationId")
            //.Enrich.With<TenantEnricher>() // TODO slow, rewrite
            .Enrich.WithExceptionDetails(new DestructuringOptionsBuilder()
                .WithDefaultDestructurers()
                .WithDestructurers(new[] {new DbUpdateExceptionDestructurer()}));
    }
    
    private static LoggerConfiguration ConfigureDefaultDevelopmentLogger(this LoggerConfiguration configuration)
    {
        var developmentTemplate = "[{Timestamp:HH:mm:ss} {Level:u3} {SourceContext}] {Message:lj}{NewLine}{Exception}";
        
        return configuration
            .WriteTo.Console(outputTemplate: developmentTemplate)
            .WriteTo.Debug(outputTemplate: developmentTemplate)
            .WriteTo.File("./logs/log-.txt",
                outputTemplate: developmentTemplate,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7)
            .MinimumLevel.Override("EasyNetQ.RabbitAdvancedBus", LogEventLevel.Verbose);
    }
    
    private static LoggerConfiguration ConfigureDefaultProductionLogger(this LoggerConfiguration configuration)
    {
        return configuration
            .WriteTo.Async(sinkConfiguration => sinkConfiguration
                .Console(new GkeJsonFormatter()));
    }
}