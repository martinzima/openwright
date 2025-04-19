using System.Globalization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Revo.AspNetCore.Core;

namespace OpenWright.Platform.AspNetCore;

public class AspNetCoreStartupConfigurer : IAspNetCoreStartupConfigurer
{
    public void ConfigureServices(IServiceCollection services)
    {
        services
            .AddControllers(options =>
            {
                //options.Filters.Add(new ODataQueryableResultFilter());
                //options.Filters.Add(new QueryableResultFilter());
                options.Filters.Add(new ResponseCacheAttribute()
                {
                    NoStore = true,
                    Location = ResponseCacheLocation.None
                });
                options.Filters.Add<OperationCanceledExceptionFilter>();
            });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        var supportedCultures = CultureInfo.GetCultures(CultureTypes.AllCultures);

        app.UseRequestLocalization(new RequestLocalizationOptions
        {
            DefaultRequestCulture = new RequestCulture("en-US"),
            // Formatting numbers, dates, etc.
            SupportedCultures = supportedCultures,
            // UI strings that we have localized.
            SupportedUICultures = supportedCultures
        });
    }
}