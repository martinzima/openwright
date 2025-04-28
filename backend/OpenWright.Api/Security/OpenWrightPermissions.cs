using Revo.Core.Security;

namespace OpenWright.Api.Security;

[PermissionTypeCatalog("OpenWright")]
public static class OpenWrightPermissions
{
    public const string TestSuiteView = "46757220-2106-403C-B10E-84581D688F64";
    public const string TestRunView = "4A1EDE55-DD78-416B-8DBE-3AF3D915104C";
    
    public const string OrganizationAdmin = "6B8CA25D-8E78-4277-B9E1-9661CB7CA771";
    
    public const string BillingAdmin = "4C8EEFB7-8387-4B71-BC4C-C7BD8BE57DE7";

    public const string UserAdmin = "1ADC66CC-8829-45E7-807A-FCF7D2D1C145";
}