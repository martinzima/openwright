namespace OpenWright.Api.Core;

public struct Optional<T> : IOptional
{
    public static readonly Optional<T> Undefined = default(Optional<T>);

    private readonly T value;
        
    public Optional(T value)
    {
        this.value = value;
        IsSet = true;
    }

    public T Value => /* IsSet
        ? value
        : throw new NullReferenceException($"Optional<{typeof(T).FullName}>.Value has not been set.");*/
        value; //TODO

    public bool IsSet { get; }
    object IOptional.Value => Value;

    public static implicit operator Optional<T>(T value)
    {
        return new Optional<T>(value);
    }
        
    public T GetValueOrDefault()
    {
        return IsSet ? value : default(T);
    }

    public T GetValueOrDefault(T @default)
    {
        return IsSet ? value : @default;
    }

    public T GetValueOrThrow(string fieldName = null)
    {
        if (IsSet)
        {
            return value;
        }

        throw new InvalidOperationException($"{fieldName ?? typeof(T).Name} must be specified");
    }

    public override bool Equals(object obj)
    {
        if (obj == null)
        {
            return IsSet && Value == null;
        }

        if (obj is T val)
        {
            return IsSet && val.Equals(Value);
        }

        return obj is Optional<T> other
               && other.IsSet == IsSet
               && (!IsSet || Equals(Value, other.Value));
    }

    public static bool operator ==(Optional<T> first, Optional<T> second)
    {
        return first.IsSet == second.IsSet
               && (!first.IsSet || Equals(first.Value, second.Value));
    }
        
    public static bool operator ==(Optional<T> first, T second)
    {
        return first.IsSet && Equals(first.Value, second);
    }
        
    public static bool operator !=(Optional<T> first, Optional<T> second)
    {
        return first.IsSet != second.IsSet
               || (first.IsSet && !Equals(first.Value, second.Value));
    }

    public static bool operator !=(Optional<T> first, T second)
    {
        return !first.IsSet || !Equals(first.Value, second);
    }

    public override int GetHashCode()
    {
        return IsSet
            ? (!typeof(T).IsValueType && Value == null ? 0 : Value.GetHashCode())
            : -1;
    }
        
    public override string ToString()
    {
        return $"Optional<{typeof(T).Name}>{{{(IsSet ? Value?.ToString() : "not set")}}}";
    }
}