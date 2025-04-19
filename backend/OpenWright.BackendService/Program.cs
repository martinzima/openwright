using OpenWright.BackendService;
using OpenWright.Platform.Logging;
using OpenWright.Platform.Sentry;
using Serilog;
using Serilog.Extensions.Logging;

LoggingHelpers.ConfigureBootstrapSerilog();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.WebHost.ConfigureSentry();
    builder.ConfigureSerilog();

    var startup = new Startup(builder.Configuration, new SerilogLoggerFactory());
    startup.ConfigureServices(builder.Services);

    var app = builder.Build();
    app.UseCustomSerilogRequestLogging();
    
    startup.Configure(app, app.Environment);
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}