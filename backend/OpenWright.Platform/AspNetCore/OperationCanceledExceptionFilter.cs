using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace OpenWright.Platform.AspNetCore;

public class OperationCanceledExceptionFilter(ILoggerFactory loggerFactory) : ExceptionFilterAttribute
{
    private readonly ILogger logger = loggerFactory.CreateLogger<OperationCanceledExceptionFilter>();

    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is OperationCanceledException)
        {
            logger.LogInformation("Request was cancelled");
            context.ExceptionHandled = true;
            context.Result = new StatusCodeResult(499);
        }
    }
}