namespace OpenWright.Common.Core;

public static class OptionalHelpers
{
    public static bool IsOptional(this Type optionalType) => optionalType.IsConstructedGenericType && optionalType.GetGenericTypeDefinition() == typeof(Optional<>);
    
    public static Type? GetUnderlyingType(Type optionalType) => IsOptional(optionalType) ? optionalType.GetGenericArguments()[0] : null;

}