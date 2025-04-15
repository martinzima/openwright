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
        'OpenWright-Tenant-Id': config.tenantId,
      },
    });
  }

  createRun(payload: CreateRunPayload): Promise<void> {
    return this.axiosInstance.post('/runs', payload);
  }

  /*createRunCase(
    runId: string,
    payload: CreateRunCasePayload,
  ): Promise<void> {
    return this.axiosInstance.post(`/runs/${runId}/cases`, payload);
  }*/

  // New bulk update method
  updateRunCaseExecutions(
    runId: string,
    payload: UpsertCaseExecutionsPayload): Promise<void> {
    return this.axiosInstance.patch(`/runs/${runId}/executions/bulk`, payload);
  }
} 