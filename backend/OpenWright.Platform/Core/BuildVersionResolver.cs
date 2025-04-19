using System.Diagnostics;
using System.Reflection;
using Microsoft.Extensions.Logging.Abstractions;
using Revo.Core.Types;

namespace OpenWright.Platform.Core;

public static class BuildVersionResolver
{
    public static string? GetBuildVersion()
    {
        var startupClasses = new TypeExplorer(new NullLogger<TypeExplorer>())
            .GetAllTypes()
            .Where(x => x.Name == "Startup" && x.Assembly.GetName().Name.StartsWith("OpenWright."))
            .ToArray();
        Assembly? assembly;
               
        if (startupClasses.Length > 1)
        {
            throw new InvalidOperationException("Multiple Startup classes in OpenWright.* assemblies found");
        }
            
        if (startupClasses.Length == 0)
        {
            assembly = Assembly.GetEntryAssembly();
        }
        else
        {
            assembly = startupClasses[0].Assembly;
        }
                
        if (!string.IsNullOrEmpty(assembly?.Location))
        {
            return FileVersionInfo.GetVersionInfo(assembly.Location).ProductVersion;
        }
        else
        {
            return assembly?.GetName().Version?.ToString();
        }
    }
}