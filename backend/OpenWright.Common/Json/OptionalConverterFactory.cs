using System.Text.Json;
using System.Text.Json.Serialization;
using OpenWright.Common.Core;

namespace OpenWright.Common.Json;

public sealed class OptionalConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert) => typeToConvert.IsOptional();

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var underlyingType = OptionalHelpers.GetUnderlyingType(typeToConvert);
        return underlyingType is null
            ? null
            : Activator.CreateInstance(typeof(OptionalConverter<>).MakeGenericType(underlyingType)) as JsonConverter;
    }
}