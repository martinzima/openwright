using Revo.Core.Commands;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Reporting.Api;

public class ReportingCommandHandler(
    ITenantContext tenantContext) :
    ICommandHandler<CreateRunCommand>,
    ICommandHandler<UpsertCaseExecutionsCommand>
{
    public async Task HandleAsync(CreateRunCommand command, CancellationToken cancellationToken)
    {
        
        
    }

    public Task HandleAsync(UpsertCaseExecutionsCommand command, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}