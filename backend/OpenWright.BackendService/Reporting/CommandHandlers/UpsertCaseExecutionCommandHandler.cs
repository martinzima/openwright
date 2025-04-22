using OpenWright.BackendService.Reporting.Commands;
using OpenWright.BackendService.Runs.Domain;
using Revo.Core.Commands;
using Revo.DataAccess.Entities;
using Revo.Infrastructure.Repositories;

namespace OpenWright.BackendService.Reporting.CommandHandlers;

public class UpsertCaseExecutionsCommandHandler(
    IRepository repository) :
    ICommandHandler<UpsertCaseExecutionsCommand>
{
    public async Task HandleAsync(UpsertCaseExecutionsCommand command, CancellationToken cancellationToken)
    {
        var run = await repository.GetAsync<Run>(command.RunId);

        foreach (var executionPayload in command.Payload)
        {
            var runCase = run.Cases.FirstOrDefault(c => c.Id == executionPayload.RunCaseId);
            if (runCase == null)
            {
                throw new EntityNotFoundException($"Cannot find run case with ID {executionPayload.RunCaseId} in run {command.RunId}");
            }

            var execution = runCase.Executions
                .FirstOrDefault(x => x.Id == executionPayload.Id);
            if (execution == null)
            {
                execution = runCase.AddExecution(executionPayload.Id,
                    executionPayload.StartDate.GetValueOrThrow(nameof(executionPayload.StartDate)));
            }
        
            if (executionPayload.Duration.IsSet)
            {
                execution.UpdateDuration(TimeSpan.FromMilliseconds(executionPayload.Duration.Value));
            }
        
            if (executionPayload.Retry.IsSet)
            {
                execution.UpdateRetry(executionPayload.Retry.Value);
            }

            if (executionPayload.Status.IsSet)
            {
                execution.UpdateStatus(executionPayload.Status.Value);
            }

            if (executionPayload.Errors.IsSet)
            {
                foreach (var error in executionPayload.Errors.Value)
                {
                    execution.AddError(error);
                }
            }
        
            if (executionPayload.Stdout.IsSet)
            {
                foreach (var stdout in executionPayload.Stdout.Value)
                {
                    execution.AddStdout(stdout);
                }
            }
        
            if (executionPayload.Stderr.IsSet)
            {
                foreach (var stderr in executionPayload.Stderr.Value)
                {
                    execution.AddStderr(stderr);
                }
            }
        }
    }
}