using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OpenWright.Platform.Core;
using Revo.Core.Security;
using Revo.DataAccess.Entities;

namespace OpenWright.Platform.AspNetCore;

[Route("error")]
[AllowAnonymous]
[ApiExplorerSettings(GroupName = "private")]
public class ErrorController : ControllerBase
{
    [Route("")]
    public IActionResult Error()
    {
        var exceptionHandlerPathFeature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();

        if (exceptionHandlerPathFeature?.Error == null)
        {
            return NotFound();
        }

        ErrorResultDto error;
        int statusCode = 500;

        var exception = exceptionHandlerPathFeature.Error;
            
        // should probably be handled higher, e.g. FilterCommandBusMiddleware or Ninject factory functions should unwrap these
        if (exception is TargetInvocationException targetInvocationExc)
        {
            exception = exception.InnerException;
        }
            
        switch (exception)
        {
            case ValidationException:
                statusCode = 400;
                exception.AddClientData(nameof(Exception.Message), exception.Message);
                error = new ErrorResultDto()
                {
                    Data = exception.GetClientData(),
                    Error = nameof(ValidationException),
                    TraceId = HttpContext.TraceIdentifier
                };
                break;

            case AuthorizationException:
                statusCode = 403;
                error = new ErrorResultDto()
                {
                    Data = exception.GetClientData(),
                    Error = nameof(AuthorizationException),
                    TraceId = HttpContext.TraceIdentifier
                };
                break;

            case EntityNotFoundException:
                statusCode = 404;
                error = new ErrorResultDto()
                {
                    Data = exception.GetClientData(),
                    Error = nameof(EntityNotFoundException),
                    TraceId = HttpContext.TraceIdentifier
                };
                break;

            default:
                error = new ErrorResultDto()
                {
                    Data = exception.GetClientData(),
                    Error = nameof(Exception),
                    TraceId = HttpContext.TraceIdentifier
                };
                break;
        }

        return StatusCode(statusCode, error);
    }
}