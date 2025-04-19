using Microsoft.AspNetCore.Mvc;
using OpenWright.Api.Reporting.Payloads;
using Revo.AspNetCore.Web;

namespace OpenWright.BackendService.Reporting.Api;

[ApiController]
[Route("api/reporting")]
public class ReportingController : CommandApiController
{
    [HttpPost("runs")]
    public async Task CreateRun([FromBody] CreateRunPayload payload)
    {
        await CommandGateway.SendAsync(new CreateRunCommand() { Payload = payload });
    }

    [HttpPatch("runs/{runId}/executions/bulk")]
    public async Task UpdateRunCaseExecutions(Guid runId, [FromBody] UpsertCaseExecutionPayload payload)
    {
        await CommandGateway.SendAsync(new UpsertCaseExecutionsCommand()
        {
            RunId = runId,
            Payload = payload
        });
    }
}