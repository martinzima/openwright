using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using OpenWright.Platform.Core;
using Revo.Core.Security;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Events.Async;

namespace OpenWright.Platform.Sentry;

public static class SentryIntegrationHelper
{
    public static IWebHostBuilder ConfigureSentry(this IWebHostBuilder webBuilder,
        Func<SentryEvent, SentryEvent> beforeSend = null)
    {
        return webBuilder
            .UseSentry((webHostBuilderContext, sentryBuilder) =>
            {
                var buildVersion = BuildVersionResolver.GetBuildVersion();

                sentryBuilder.Release = buildVersion;
                sentryBuilder.Environment =
                    webHostBuilderContext.Configuration.GetSection("Sentry")["EnvironmentName"];
                sentryBuilder.SendDefaultPii = true;

                sentryBuilder.SetBeforeSend(sentryEvent =>
                {
                    if (beforeSend != null)
                    {
                        sentryEvent = beforeSend(sentryEvent);
                    }

                    if (sentryEvent == null)
                    {
                        return null;
                    }
                        
                    if (sentryEvent.Exception != null)
                    {
                        switch (sentryEvent.Exception)
                        {
                            case AuthorizationException:
                                return null;

                            case AsyncEventProcessingException:
                                // Revo also logs the original exception before throwing AsyncEventProcessingException, so this one is actually redundant
                                return null;

                            case TargetInvocationException targetInvocationExc:
                                // e.g. thrown by injected factory functions, for example when resolving tenant
                                if (targetInvocationExc.InnerException is AuthorizationException)
                                {
                                    return null;
                                }

                                break;

                            case OptimisticConcurrencyException:
                                return null;
                        }
                    }

                    return sentryEvent;
                });
            });
    }
}