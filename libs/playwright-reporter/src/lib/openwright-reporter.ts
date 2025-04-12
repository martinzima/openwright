import { TestError as ApiTestError, CreateRunCasePayload, CreateRunPayload, CreateRunSuite, RunReportingApiConfig, RunReportingApiService, TestLocation, TestStatus, UpsertCaseExecutionPayload, UpsertCaseExecutionsPayload } from '@openwright/reporting-api';
import { generateUuidV4 } from '@openwright/shared-utils';
import type { FullConfig, FullResult, Location, TestError as PlaywrightTestError, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export interface OpenWrightReporterConfig extends RunReportingApiConfig {
  projectId: string;
  updateIntervalMs?: number; // Default 5000ms
}

export class OpenWrightReporter implements Reporter {
  private queueIntervalId: NodeJS.Timeout | null = null;
  private readonly config: Required<Omit<OpenWrightReporterConfig, 'baseUrl' | 'reportingClientKey' | 'tenantId'> & RunReportingApiConfig>;
  private readonly apiService: RunReportingApiService;
  private runId!: string;
  private startTime!: Date;
  private testIdToCaseIdMap: Record<string, string> = {};
  private testIdToExecutionIdMap: Record<string, string> = {};
  private pendingExecutionUpserts: Record<string, UpsertCaseExecutionPayload> = {};
  private isProcessingQueue = false;
  private lastApiCallTime = 0;

  constructor(options: OpenWrightReporterConfig) {
    this.config = {
      ...options,
      updateIntervalMs: options.updateIntervalMs ?? 5000,
    };
    this.apiService = new RunReportingApiService({
      baseUrl: this.config.baseUrl,
      reportingClientKey: this.config.reportingClientKey,
      tenantId: this.config.tenantId,
    });
  }

  printsToStdio() {
    return false; // We don't print to stdio, let Playwright use its default reporter
  }

  async onBegin(config: FullConfig, suite: Suite): Promise<void> {
    this.runId = generateUuidV4();
    this.startTime = new Date();
    console.log(`🚀 OpenWright Reporter: Run ID ${this.runId}`);
    console.log(`🌎 Reporting to project ID: ${this.config.projectId}, instance URL: ${this.config.baseUrl}`);

    this.testIdToCaseIdMap = {};
    this.testIdToExecutionIdMap = {};
    this.pendingExecutionUpserts = {};

    const rootSuitePayload = this.mapSuiteToApi(suite);

    const payload: CreateRunPayload = {
      id: this.runId,
      projectId: this.config.projectId,
      startDate: this.startTime.toISOString(),
      rootSuite: rootSuitePayload,
    };

    try {
      await this.apiService.createRun(payload);
      console.debug(`✅ OpenWright Reporter: Run ${this.runId} created.`);
      this.startQueueProcessing();
    } catch (error) {
      console.debug(`❌ OpenWright Reporter: Failed to create run ${this.runId}`, error);
    }
  }

  async onTestBegin(test: TestCase, result: TestResult): Promise<void> {
    console.debug(`▶️ OpenWright Reporter: Test Begin - ${test.titlePath().join(' > ')}`);
    const caseId = this.testIdToCaseIdMap[test.id];

    if (!caseId) {
      console.error(`❌ OpenWright Reporter: Could not find pre-generated caseId for test ${test.id}. Cannot process test begin.`);
      return;
    }

    const executionId = generateUuidV4();
    this.testIdToExecutionIdMap[test.id] = executionId;

    console.debug(`➕ OpenWright Reporter: Queuing initial state for execution ${executionId} (case ${caseId})`);

    const initialUpsertPayload: UpsertCaseExecutionPayload = {
      id: executionId,
      startDate: result.startTime.toISOString(),
      retry: result.retry,
      status: this.mapPlaywrightStatusToApi(result.status) // TODO what is the status here?
    };

    this.pendingExecutionUpserts[executionId] = initialUpsertPayload;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const statusEmoji = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : result.status === 'timedOut' ? '⏱️' : result.status === 'skipped' ? '⏭️' : '❓';
    console.debug(`${statusEmoji} OpenWright Reporter: Test End - ${test.titlePath().join(' > ')} - Status: ${result.status}`);

    const caseId = this.testIdToCaseIdMap[test.id];
    const executionId = this.testIdToExecutionIdMap[test.id];

    if (!caseId || !executionId) {
      console.warn(`⚠️ OpenWright Reporter: No caseId (${caseId ?? 'undefined'}) or executionId (${executionId ?? 'undefined'}) found for test ${test.id}. Skipping result processing.`);
      return;
    }

    console.debug(`🔄 OpenWright Reporter: Queuing final state for execution ${executionId}`);

    const endUpsertPayload: UpsertCaseExecutionPayload = {
      id: executionId,
      duration: result.duration,
      status: this.mapPlaywrightStatusToApi(result.status),
      errors: result.errors?.map(this.formatPlaywrightErrorToApi),
      stdout: result.stdout?.map(chunk => typeof chunk === 'string' ? chunk : chunk.toString('utf-8')),
      stderr: result.stderr?.map(chunk => typeof chunk === 'string' ? chunk : chunk.toString('utf-8')),
    };

    let executionUpsertPayload: UpsertCaseExecutionPayload = this.pendingExecutionUpserts[executionId];
    if (executionUpsertPayload) {
      executionUpsertPayload = {
        ...executionUpsertPayload,
        ...endUpsertPayload
      };
    } else {
      executionUpsertPayload = endUpsertPayload;
    }
    
    this.pendingExecutionUpserts[executionId] = executionUpsertPayload;
  }

  async onEnd(result: FullResult): Promise<void> {
    const finalStatusEmoji = result.status === 'passed' ? '🎉' : result.status === 'failed' ? '💥' : '⚠️';
    console.log(`${finalStatusEmoji} OpenWright Reporter: Run finished - status: ${result.status}`);
    
    await this.waitForQueueToDrain();
    this.stopQueueProcessing();

    console.log(`🏁 OpenWright Reporter: All updates sent for run ${this.runId}.`);
  }

  onError(error: PlaywrightTestError): void {
    // TODO handle these
    console.error(`💥 OpenWright Reporter: Global Error - ${error.message || 'Unknown Error'}`, error.stack);
  }

  private startQueueProcessing(): void {
    if (this.queueIntervalId) {
      return;
    }

    console.trace(`⏳ OpenWright Reporter: Starting update queue processing with interval ${this.config.updateIntervalMs}ms.`);
    
    this.queueIntervalId = setInterval(() => {
      void this.processUpdateQueue();
    }, this.config.updateIntervalMs);
  }

  private stopQueueProcessing(): void {
    if (this.queueIntervalId) {
      console.debug("🛑 OpenWright Reporter: Stopping update queue processing.");
      clearInterval(this.queueIntervalId);
      this.queueIntervalId = null;
    }
  }

  private async processUpdateQueue(force?: boolean): Promise<void> {
    const pendingKeys = Object.keys(this.pendingExecutionUpserts);
    if (this.isProcessingQueue || pendingKeys.length === 0) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastApiCallTime < this.config.updateIntervalMs) {
      return;
    }

    this.isProcessingQueue = true;
    const itemsToSend: UpsertCaseExecutionPayload[] = [];
    const keysToSend = [...pendingKeys];

    for (const key of keysToSend) {
      itemsToSend.push(this.pendingExecutionUpserts[key]);
      delete this.pendingExecutionUpserts[key];
    }

    if (itemsToSend.length > 0) {
      const bulkPayload: UpsertCaseExecutionsPayload = itemsToSend;
      console.log(`📤 OpenWright Reporter: Sending bulk upsert for ${bulkPayload.length} execution(s)...`);
      try {
        this.lastApiCallTime = Date.now();
        await this.apiService.updateRunCaseExecutions(this.runId, bulkPayload);
        console.trace(`✅ OpenWright Reporter: Bulk upsert sent successfully for ${bulkPayload.length} execution(s).`);
      } catch (error) {
        console.trace(`❌ OpenWright Reporter: Failed to send bulk upsert.`, error);
      } finally {
        this.isProcessingQueue = false;
      }
    } else {
      this.isProcessingQueue = false;
    }
  }

  private async waitForQueueToDrain(): Promise<void> {
    console.debug(`⏱️ OpenWright Reporter: Waiting for execution upsert queue to drain (${Object.keys(this.pendingExecutionUpserts).length} items remaining)...`);
    while (Object.keys(this.pendingExecutionUpserts).length > 0 || this.isProcessingQueue) {
      if (Object.keys(this.pendingExecutionUpserts).length > 0 && !this.isProcessingQueue) {
        await this.processUpdateQueue(true);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.debug("✅ OpenWright Reporter: Execution upsert queue drained.");
  }

  private formatLocation(location?: Location): TestLocation | undefined {
    if (!location) return undefined;
    return {
      file: location.file,
      line: location.line,
      column: location.column,
    };
  }

  private mapPlaywrightStatusToApi(status: TestResult['status']): TestStatus {
    switch (status) {
      case 'passed':
        return TestStatus.Passed;
      case 'failed':
        return TestStatus.Failed;
      case 'timedOut':
        return TestStatus.TimedOut;
      case 'skipped':
        return TestStatus.Skipped;
      case 'interrupted':
        return TestStatus.Interrupted;
      default:
        console.warn(`⚠️ OpenWright Reporter: Unknown Playwright status "${status}", mapping to Failed.`);
        return TestStatus.Failed;
    }
  }

  private formatPlaywrightErrorToApi(error: PlaywrightTestError): ApiTestError {
    return {
      message: error.message ?? 'Error message unavailable',
      stack: error.stack,
    };
  }

  private mapSuiteToApi = (suite: Suite): CreateRunSuite => {
    const nestedSuites: CreateRunSuite[] = suite.suites.map(this.mapSuiteToApi);
    const nestedCases: CreateRunCasePayload[] = suite.tests.map(this.mapTestCaseToApi);

    return {
      title: suite.title,
      location: this.formatLocation(suite.location),
      suites: nestedSuites.length > 0 ? nestedSuites : undefined,
      cases: nestedCases.length > 0 ? nestedCases : undefined,
    };
  }

  private mapTestCaseToApi = (test: TestCase): CreateRunCasePayload => {
    const caseId = generateUuidV4();
    this.testIdToCaseIdMap[test.id] = caseId;

    return {
      id: caseId,
      title: test.title,
      timeout: test.timeout,
      expectedStatus: this.mapPlaywrightStatusToApi(test.expectedStatus)
    };
  }
}

export default OpenWrightReporter; 