using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using OpenWright.Common.Core;

namespace OpenWright.Common.Json;

public sealed class OptionalConverter<T> : JsonConverter<Optional<T>>
{
    public override void Write(Utf8JsonWriter writer, Optional<T> value, JsonSerializerOptions options)
    {
        if (!value.IsSet)
        {
            writer.WriteNullValue();
            return;
        }
        
        var typeInfo = options.GetTypeInfo(typeof(T));
        if (typeInfo is JsonTypeInfo<T?> typed)
        {
            JsonSerializer.Serialize(writer, value.Value, typed);
        }
        else
        {
            JsonSerializer.Serialize(writer, value.Value, typeInfo);
        }
    }

    public override Optional<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType is JsonTokenType.Null)
        {
            return new(default!);
        }

        var typeInfo = options.GetTypeInfo(typeof(T));
        if (typeInfo is JsonTypeInfo<T?>)
        {
            return new(JsonSerializer.Deserialize(ref reader, (JsonTypeInfo<T>) typeInfo)!);
        }
        
        return new((T?)JsonSerializer.Deserialize(ref reader, typeInfo)!);
    }
}