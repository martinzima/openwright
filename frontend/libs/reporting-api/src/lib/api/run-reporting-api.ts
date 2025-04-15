import { CreateRunPayload } from '../model/create-run-payload';
import { UpsertCaseExecutionsPayload } from '../model/upsert-case-execution-payload';

export interface RunReportingApi {
  createRun(payload: CreateRunPayload): Promise<void>;
  updateRunCaseExecutions(runId: string,
    payload: UpsertCaseExecutionsPayload): Promise<void>;
} 