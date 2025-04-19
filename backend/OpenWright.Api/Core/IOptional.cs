namespace OpenWright.Api.Core;

public interface IOptional
{
    bool IsSet { get; }
    object Value { get; }
}