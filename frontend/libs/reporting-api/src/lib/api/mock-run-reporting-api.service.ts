import { RunReportingApiConfig } from '../config/run-reporting-api.config';
import { CreateRunPayload } from '../model/create-run-payload';
import { UpsertCaseExecutionsPayload } from '../model/upsert-case-execution-payload';
import { RunReportingApi } from './run-reporting-api';

export class MockRunReportingApiService implements RunReportingApi {
  constructor(private readonly config: RunReportingApiConfig) {
    console.log(`🧪 MockRunReportingApiService: Initialized with baseUrl: ${config.baseUrl}`);
  }

  async createRun(payload: CreateRunPayload): Promise<void> {
    console.log(`🧪 MockRunReportingApiService: Creating run with ID ${payload.id}`);
    console.log(`🧪 MockRunReportingApiService: Run payload:`, JSON.stringify(payload, null, 2));
    
    await this.delay(200);
  }

  async updateRunCaseExecutions(runId: string,
    payload: UpsertCaseExecutionsPayload): Promise<void> {
    console.log(`🧪 MockRunReportingApiService: Updating ${payload.length} executions for run ${runId},\npayload:`, JSON.stringify(payload, null, 2));

    await this.delay(200);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 