namespace OpenWright.Platform.Core;

public static class ExceptionClientDataHelper
{
    public const string ClientDataPrefix = "olify:client_data:";

    public static T AddClientData<T>(this T exception,
        string name, object value) where T : Exception
    {
        exception.Data[ClientDataPrefix + name] = value;
        return exception;
    }

    public static Dictionary<string, object> GetClientData(this Exception exception)
    {
        Dictionary<string, object> result = null;
        foreach (var key in exception.Data.Keys)
        {
            if (key is string keyStr && keyStr.StartsWith(ClientDataPrefix))
            {
                result ??= new();
                result[keyStr.Substring(ClientDataPrefix.Length)] = exception.Data[key];
            }
        }

        return result;
    }
}