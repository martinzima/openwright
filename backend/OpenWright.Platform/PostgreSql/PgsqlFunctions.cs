using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;

namespace OpenWright.Platform.PostgreSql;

public static class PgsqlFunctions
{
    /*** NOTE used as a workaround for EF Core bug https://github.com/aspnet/EntityFrameworkCore/issues/17374 ***/
    [DbFunction("com_contains_uuid")]
    public static bool UuidContains(this Guid[] array, Guid element) => array.Contains(element);

    [DbFunction("com_contains_array_uuid")]
    public static bool UuidContainsArray(this Guid[] haystack, Guid[] needles) => needles.All(haystack.Contains);

    [DbFunction("com_is_contained_by_array_uuid")]
    public static bool UuidIsContainedByArray(this Guid[] needles, Guid[] haystack) => needles.All(haystack.Contains);

    [DbFunction("com_array_overlap_uuid")]
    public static bool UuidArrayOverlap(this Guid[] arr1, Guid[] arr2) => arr1.Any(arr2.Contains);

    [DbFunction("com_to_tsvector")]
    public static NpgsqlTsVector BaseToTsVector(string document) => throw new NotSupportedException();
        
    public static object JsonGet(IDictionary<string, object> json, string key) => throw new NotSupportedException();
}