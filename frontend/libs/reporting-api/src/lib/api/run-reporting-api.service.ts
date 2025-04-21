import axios, { AxiosInstance } from 'axios';
import { RunReportingApiConfig } from '../config/run-reporting-api.config';
import { CreateRunPayload } from '../model/create-run-payload';
import { UpsertCaseExecutionsPayload } from '../model/upsert-case-execution-payload';
import { RunReportingApi } from './run-reporting-api';

export class RunReportingApiService implements RunReportingApi {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: RunReportingApiConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'OpenWright-Reporting-Client-Key': config.reportingClientKey,
        'OpenWright-Organization-Id': config.tenantId
      }
    });
  }

  createRun(payload: CreateRunPayload): Promise<void> {
    console.log('createRun', payload);
    return this.axiosInstance.post('/reporting/runs', payload);
  }

  updateRunCaseExecutions(
    runId: string,
    payload: UpsertCaseExecutionsPayload): Promise<void> {
    return this.axiosInstance.patch(`/reporting/runs/${runId}/executions/bulk`, payload);
  }
}