import { TestError as ApiTestError, CreateRunCasePayload, CreateRunPayload, CreateRunSuitePayload, RunReportingApi, RunReportingApiConfig, RunReportingApiService, TestLocation, TestStatus, UpsertCaseExecutionPayload, UpsertCaseExecutionsPayload, CommitInfo, ActorInfo } from '@openwright/reporting-api';
import { generateUuidV4 } from '@openwright/shared-utils';
import { getActorInfo, getCommitInfo } from '@openwright/reporter-common';
import type { FullConfig, FullResult, Location, TestError as PlaywrightTestError, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export interface OpenWrightReporterConfig extends RunReportingApiConfig {
  projectId: string;
  updateIntervalMs?: number;
  apiService?: RunReportingApi;
  debugLogging?: boolean;
}

interface OpenWrightReporterConfigFull extends OpenWrightReporterConfig {
  updateIntervalMs: number;
  debugLogging: boolean;
}

export class OpenWrightReporter implements Reporter {
  private readonly config: OpenWrightReporterConfigFull;
  private readonly apiService: RunReportingApi;

  private queueIntervalId: NodeJS.Timeout | null = null;
  private runId: string | null = null;
  private testIdToCaseIdMap: Record<string, string> = {};
  private testExecutionTracking: Map<string, { executionId: string }> = new Map();
  private pendingExecutionUpserts: UpsertCaseExecutionPayload[] = [];
  private isProcessingQueue = false;
  private lastApiCallTime = 0;

  constructor(options: OpenWrightReporterConfig) {
    this.config = {
      ...options,
      updateIntervalMs: options.updateIntervalMs ?? 5000,
      debugLogging: options.debugLogging ?? false
    };

    this.apiService = options.apiService ?? new RunReportingApiService({
      baseUrl: this.config.baseUrl,
      reportingClientKey: this.config.reportingClientKey,
      tenantId: this.config.tenantId,
    });
  }

  private debugLog(message: string, ...optionalParams: any[]): void {
    if (this.config.debugLogging) {
      console.debug(message, ...optionalParams);
    }
  }

  printsToStdio() {
    return false;
  }

  async onBegin(config: FullConfig, suite: Suite): Promise<void> {
    this.runId = generateUuidV4();
    console.log(`🚀 OpenWright Reporter: Run ID ${this.runId}`);
    console.log(`🌎 Reporting to project ID: ${this.config.projectId}, instance URL: ${this.config.baseUrl}`);

    this.testIdToCaseIdMap = {};
    this.testExecutionTracking.clear();
    this.pendingExecutionUpserts = [];

    const rootSuite = this.mapSuiteToApi(suite, null);
    const commitInfo = getCommitInfo();
    const actorInfo = getActorInfo();

    const payload: CreateRunPayload = {
      id: this.runId,
      projectId: this.config.projectId,
      startDate: new Date().toISOString(),
      suites: rootSuite.suites ?? [],
      commit: commitInfo,
      actor: actorInfo,
      // TODO: Add description, pullRequestNumber from env vars if available
    };

    try {
      await this.apiService.createRun(payload);
      this.debugLog(`✅ OpenWright Reporter: Run ${this.runId} created.`);
      this.startQueueProcessing();
    } catch (error) {
      this.debugLog(`❌ OpenWright Reporter: Failed to create run ${this.runId}`, error);
    }
  }

  async onTestBegin(test: TestCase, result: TestResult): Promise<void> {
    this.debugLog(`▶️ OpenWright Reporter: Test Begin - ${test.titlePath().join(' > ')} (Retry ${result.retry})`);
    const caseId = this.testIdToCaseIdMap[test.id];

    if (!caseId) {
      console.error(`❌ OpenWright Reporter: Could not find pre-generated caseId for test ${test.id}. Cannot process test begin.`);
      return;
    }

    const executionId = generateUuidV4();
    const trackingKey = `${test.id}-${result.retry}`;

    this.testExecutionTracking.set(trackingKey, { executionId });

    this.debugLog(`➕ OpenWright Reporter: Queuing initial state for execution ${executionId} (case ${caseId}, retry ${result.retry})`);

    const initialUpsertPayload: UpsertCaseExecutionPayload = {
      id: executionId,
      runCaseId: caseId,
      startDate: result.startTime.toISOString(),
      retry: result.retry
    };

    this.pendingExecutionUpserts.push(initialUpsertPayload);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const statusEmoji = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : result.status === 'timedOut' ? '⏱️' : result.status === 'skipped' ? '⏭️' : '❓';
    this.debugLog(`${statusEmoji} OpenWright Reporter: Test End - ${test.titlePath().join(' > ')} (Retry ${result.retry}) - Status: ${result.status}`);

    const caseId = this.testIdToCaseIdMap[test.id];
    const trackingKey = `${test.id}-${result.retry}`;
    const trackingInfo = this.testExecutionTracking.get(trackingKey);

    if (!caseId || !trackingInfo) {
      console.warn(`⚠️ OpenWright Reporter: No caseId (${caseId ?? 'undefined'}) or execution tracking info found for test ${test.id} retry ${result.retry}. Skipping result processing.`);
      return;
    }

    const executionId = trackingInfo.executionId;
    this.debugLog(`🔄 OpenWright Reporter: Queuing final state for execution ${executionId} (retry ${result.retry})`);

    const endUpsertPayload: UpsertCaseExecutionPayload = {
      id: executionId,
      runCaseId: caseId,
      duration: result.duration,
      status: this.mapPlaywrightStatusToApi(result.status),
      errors: result.errors?.map(this.formatPlaywrightErrorToApi),
      stdout: result.stdout?.map(chunk => typeof chunk === 'string' ? chunk : chunk.toString('utf-8')),
      stderr: result.stderr?.map(chunk => typeof chunk === 'string' ? chunk : chunk.toString('utf-8'))
    };

    this.pendingExecutionUpserts.push(endUpsertPayload);
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

    this.debugLog(`⏳ OpenWright Reporter: Starting update queue processing with interval ${this.config.updateIntervalMs}ms.`);

    this.queueIntervalId = setInterval(() => {
      void this.processUpdateQueue();
    }, this.config.updateIntervalMs);
  }

  private stopQueueProcessing(): void {
    if (this.queueIntervalId) {
      this.debugLog("🛑 OpenWright Reporter: Stopping update queue processing.");
      clearInterval(this.queueIntervalId);
      this.queueIntervalId = null;
    }
  }

  private async processUpdateQueue(force?: boolean): Promise<void> {
    if (!this.runId) {
      throw new Error("⚠️ OpenWright Reporter: Run ID not set. Cannot process update queue.");
    }

    if (this.isProcessingQueue || this.pendingExecutionUpserts.length === 0) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastApiCallTime < this.config.updateIntervalMs) {
      return;
    }

    this.isProcessingQueue = true;

    const itemsToProcess = [...this.pendingExecutionUpserts];
    this.pendingExecutionUpserts = [];

    const mergedPayloadsMap = new Map<string, UpsertCaseExecutionPayload>();

    for (const payload of itemsToProcess) {
      const existing = mergedPayloadsMap.get(payload.id);
      mergedPayloadsMap.set(payload.id, { ...existing, ...payload });
    }

    const mergedItemsToSend: UpsertCaseExecutionPayload[] = Array.from(mergedPayloadsMap.values());

    if (mergedItemsToSend.length > 0) {
      const bulkPayload: UpsertCaseExecutionsPayload = mergedItemsToSend;
      console.log(`📤 OpenWright Reporter: Sending merged bulk upsert for ${bulkPayload.length} execution(s)...`);
      try {
        this.lastApiCallTime = Date.now();
        await this.apiService.updateRunCaseExecutions(this.runId, bulkPayload);
        this.debugLog(`✅ OpenWright Reporter: Merged bulk upsert sent successfully for ${bulkPayload.length} execution(s).`);
      } catch (error) {
        this.debugLog(`❌ OpenWright Reporter: Failed to send merged bulk upsert. Re-queueing ${itemsToProcess.length} original items.`, error);
        this.pendingExecutionUpserts.unshift(...itemsToProcess);
      } finally {
        this.isProcessingQueue = false;
      }
    } else {
      this.isProcessingQueue = false;
    }
  }

  private async waitForQueueToDrain(): Promise<void> {
    this.debugLog(`⏱️ OpenWright Reporter: Waiting for execution upsert queue to drain (${this.pendingExecutionUpserts.length} items remaining)...`);

    while (this.pendingExecutionUpserts.length > 0 || this.isProcessingQueue) {
      if (this.pendingExecutionUpserts.length > 0 && !this.isProcessingQueue) {
        await this.processUpdateQueue(true);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.debugLog("✅ OpenWright Reporter: Execution upsert queue drained.");
  }

  private formatLocation = (location?: Location): TestLocation | undefined => {
    if (!location) {
      return undefined;
    }

    return {
      file: location.file,
      line: location.line,
      column: location.column,
    };
  }

  private mapPlaywrightStatusToApi = (status: TestResult['status']): TestStatus => {
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

  private formatPlaywrightErrorToApi = (error: PlaywrightTestError): ApiTestError => {
    return {
      message: error.message,
      stack: error.stack,
      location: this.formatLocation(error.location),
      snippet: error.snippet,
    };
  }

  private mapSuiteToApi = (suite: Suite, runGroup: string | null): CreateRunSuitePayload => {
    let currentRunGroup = runGroup;
    if (suite.type === 'project') {
      currentRunGroup = suite.title;
    }

    const suites: CreateRunSuitePayload[] = [];
    const cases: CreateRunCasePayload[] = suite.tests.map(this.mapTestCaseToApi);

    for (const childSuite of suite.suites) {
      const createdSuite = this.mapSuiteToApi(childSuite, currentRunGroup);
      if (childSuite.type === 'project' || childSuite.type === 'file') {
        suites.push(...createdSuite.suites || []);
        cases.push(...createdSuite.cases || []);
      } else {
        suites.push(createdSuite);
      }
    }

    if (suite.type === 'root') {
      if (cases.length > 0) {
        // we don't actually send the root suite, so we need a new aux suite to contain the cases
        suites.push({
          title: null,
          cases: cases
        });
      }

      return {
        title: null,
        suites: suites
      };
    } else {
      return {
        title: suite.title,
        location: this.formatLocation(suite.location),
        suites: suites.length > 0 ? suites : undefined,
        cases: cases.length > 0 ? cases : undefined,
        runGroup: currentRunGroup ?? undefined
      };
    }
  }

  private mapTestCaseToApi = (test: TestCase): CreateRunCasePayload => {
    const caseId = generateUuidV4();
    this.testIdToCaseIdMap[test.id] = caseId;

    return {
      id: caseId,
      title: test.title,
      timeout: test.timeout,
      expectedStatus: this.mapPlaywrightStatusToApi(test.expectedStatus),
      location: this.formatLocation(test.location),
      tags: test.tags,
      retries: test.retries,
      annotations: test.annotations
    };
  }
}

export default OpenWrightReporter;