using OpenWright.Api.Projects.ValueObjects;
using OpenWright.Api.Reporting.Payloads;
using OpenWright.BackendService.Projects.Domain;
using OpenWright.BackendService.Runs.Domain;
using Revo.Core.Commands;
using Revo.Infrastructure.Repositories;
using Revo.Infrastructure.Tenancy;

namespace OpenWright.BackendService.Reporting.Api;

public class ReportingCommandHandler(
    ITenantContext tenantContext,
    IRepository repository) :
    ICommandHandler<CreateRunCommand>,
    ICommandHandler<UpsertCaseExecutionsCommand>
{
    public async Task HandleAsync(CreateRunCommand command, CancellationToken cancellationToken)
    {
        var project = await repository.GetAsync<Project>(command.Payload.ProjectId);

        var createdEntities = await EnsureSuiteTreeAndEntitiesAsync(project, command.Payload.Suites);
        await CreateRunAsync(project, command.Payload, createdEntities);
    }

    private async Task<RunEntities> EnsureSuiteTreeAndEntitiesAsync(
        Project project,
        IEnumerable<CreateRunSuitePayload> suitePayloads)
    {
        var createdEntities = new RunEntities();
        await ProcessSuitePayloadsRecursive(project, null, suitePayloads, null, createdEntities);
        return createdEntities;
    }

    private async Task ProcessSuitePayloadsRecursive(
        Project project,
        Suite? parentSuite,
        IEnumerable<CreateRunSuitePayload> suitePayloads,
        TestLocation? currentSuiteLocation,
        RunEntities runEntities)
    {
        foreach (var suitePayload in suitePayloads)
        {
            SpecFile? specFile = null;
            var effectiveLocationPayload = suitePayload.Location ?? currentSuiteLocation;

            if (effectiveLocationPayload?.File != null)
            {
                var filePath = effectiveLocationPayload.File.Replace('\\', '/');
                if (!runEntities.SpecFiles.TryGetValue(filePath, out specFile))
                {
                    specFile = await repository.FirstOrDefaultAsync<SpecFile>(sf =>
                        sf.ProjectId == project.Id && sf.Path == filePath);

                    if (specFile == null)
                    {
                        specFile = new SpecFile(Guid.NewGuid(), project, filePath);
                        repository.Add(specFile);
                    }
                    runEntities.SpecFiles[filePath] = specFile;
                }
            }

            var suite = await repository.FirstOrDefaultAsync<Suite>(s =>
                s.ProjectId == project.Id
                && s.Title == suitePayload.Title
                && (parentSuite == null ? s.ParentSuiteId == null : s.ParentSuiteId == parentSuite.Id));

            if (suite == null)
            {
                suite = parentSuite != null
                    ? new Suite(Guid.NewGuid(), parentSuite, suitePayload.Title)
                    : new Suite(Guid.NewGuid(), project, suitePayload.Title);

                repository.Add(suite);
            }

            if (suitePayload.Cases != null)
            {
                foreach (var casePayload in suitePayload.Cases)
                {
                    var caseEntity = suite.Cases.FirstOrDefault(c => casePayload.Title == c.Title)
                                     ?? suite.AddCase(casePayload.Title);

                    var fileLocation = effectiveLocationPayload != null
                        ? new FileLocation(effectiveLocationPayload.Line, effectiveLocationPayload.Column)
                        : null;
                    caseEntity.UpdateLocation(specFile, fileLocation);

                    if (casePayload.Tags != null)
                    {
                        foreach (var tag in casePayload.Tags)
                        {
                            caseEntity.AddTag(tag);
                        }
                    }

                    if (casePayload.Annotations != null)
                    {
                        foreach (var annotation in casePayload.Annotations)
                        {
                            caseEntity.AddAnnotation(annotation);
                        }
                    }

                    runEntities.Cases[casePayload.Id] = (caseEntity, casePayload, effectiveLocationPayload);
                }
            }

            if (suitePayload.Suites != null)
            {
                await ProcessSuitePayloadsRecursive(project, suite, suitePayload.Suites, effectiveLocationPayload, runEntities);
            }
        }
    }

    private async Task<Run> CreateRunAsync(
        Project project,
        CreateRunPayload payload,
        RunEntities runEntities)
    {
        var run = new Run(payload.Id, project, payload.StartDate.UtcDateTime);
        run.UpdateDescription(payload.Description);
        run.UpdatePullRequestNumber(payload.PullRequestNumber);
        run.UpdateCommitInfo(payload.Commit);
        run.UpdateActor(payload.Actor);
        repository.Add(run);

        foreach (var (caseEntity, casePayload, suiteLocationPayload) in runEntities.Cases.Values)
        {
            var runCase = run.AddCase(caseEntity);

            SpecFile? specFile = null;
            FileLocation? fileLocation = null;
            if (suiteLocationPayload?.File != null)
            {
                var filePath = suiteLocationPayload.File.Replace('\\', '/');
                if (runEntities.SpecFiles.TryGetValue(filePath, out specFile))
                {
                    fileLocation = new FileLocation(suiteLocationPayload.Line, suiteLocationPayload.Column);
                }
            }

            runCase.UpdateLocation(specFile, fileLocation);
            runCase.UpdateTimeout(casePayload.Timeout != null
                ? TimeSpan.FromSeconds((double) casePayload.Timeout)
                : null);
            runCase.UpdateRetries(casePayload.Retries);
            runCase.UpdateExpectedStatus(casePayload.ExpectedStatus);

            if (casePayload.Annotations != null)
            {
                foreach (var annotation in casePayload.Annotations)
                {
                    runCase.AddAnnotation(annotation);
                }
            }
        }

        return run;
    }

    public Task HandleAsync(UpsertCaseExecutionsCommand command, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private class RunEntities
    {
        public Dictionary<Guid, (Case CaseEntity, CreateRunCasePayload CasePayload, TestLocation? SuiteLocationPayload)> Cases { get; } = new();
        public Dictionary<string, SpecFile> SpecFiles { get; } = new();
    }
}