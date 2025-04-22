namespace OpenWright.Common.Core;

public interface IOptional
{
    bool IsSet { get; }
    object Value { get; }
}