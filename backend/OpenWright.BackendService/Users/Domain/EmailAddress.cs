using System.Text.RegularExpressions;
using Revo.Core.ValueObjects;
using Revo.Domain.Core;

namespace OpenWright.BackendService.Users.Domain;

public class EmailAddress : ValueObject<EmailAddress>
{
    public EmailAddress(string address)
    {
        if (address == null)
        {
            throw new ArgumentNullException($"EmailAddress address cannot be null");
        }
        
        var sanitized = address.ToLowerInvariant().Trim();
        if (!new Regex(@"^\w+([\.\+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$").IsMatch(sanitized))
        {
            throw new DomainException($"Invalid email address: {address}");
        }
        
        Address = sanitized;
    }

    public string Address { get; }
    
    protected override IEnumerable<(string Name, object Value)> GetValueComponents()
    {
        yield return (nameof(Address), Address);
    }
}