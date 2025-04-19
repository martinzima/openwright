using Microsoft.AspNetCore.Builder;

namespace OpenWright.Platform.AspNetCore;

public static class ExceptionHandlerExtensions
{
    public static IApplicationBuilder UseEnDoExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseExceptionHandler("/error");
    }
}