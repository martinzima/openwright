import { RunReportingApi, TestStatus } from '@openwright/reporting-api';
import type { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenWrightReporter } from './openwright-reporter';

// Simplified types based on Playwright's test reporter API
// Using these as a guide, but we'll still need type assertions in places
// since we can't fully implement the complete API interfaces
type MockTestCase = {
  id: string;
  title: string;
  titlePath: () => string[];
  timeout: number;
  expectedStatus: string;
  location?: { file: string; line: number; column: number };
};

// Helper function to validate UUID v4
const isValidUuidV4 = (uuid: string): boolean => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
};

type MockTestResult = {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted' | undefined;
  duration: number;
  retry: number;
  startTime: Date;
  errors: Array<{ message: string; stack?: string; location?: { file: string; line: number; column: number } }>;
  stdout: Array<string>;
  stderr: Array<string>;
};

type MockSuite = {
  title: string;
  type: 'root' | 'project' | 'file' | 'describe';
  location?: { file: string; line: number; column: number };
  suites: MockSuite[];
  tests: MockTestCase[];
};

// Mock Playwright types
const createMockTestCase = (id: string, title: string, expectedStatus = 'passed'): MockTestCase => ({
  id,
  title,
  timeout: 30000,
  expectedStatus,
  titlePath: () => ['Project', 'test.spec.ts', 'Test Suite', title],
  location: { file: 'test.spec.ts', line: 1, column: 1 }
});

const createMockTestResult = (status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted' | undefined = undefined, retry = 0): MockTestResult => ({
  status,
  retry,
  startTime: new Date(),
  duration: 0,
  errors: [],
  stdout: [],
  stderr: []
});

const createMockTestEndResult = (status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted' = 'passed', retry = 0): MockTestResult => ({
  status,
  retry,
  startTime: new Date(),
  duration: 100,
  errors: status === 'failed' ? [{ message: 'Test error message' }] : [],
  stdout: ['Standard output from test'],
  stderr: status === 'failed' ? ['Error output'] : []
});

// Create a suite structure following Playwright's pattern: root -> project -> file -> describe
const createMockSuite = (): MockSuite => {
  const testCases = [
    createMockTestCase('test-1', 'Test 1'),
    createMockTestCase('test-2', 'Test 2')
  ];

  // Create structure: root -> project -> file -> describe
  return {
    title: 'Root',
    type: 'root',
    location: { file: 'test.spec.ts', line: 1, column: 1 },
    suites: [
      {
        title: 'Project',
        type: 'project',
        location: { file: 'test.spec.ts', line: 2, column: 1 },
        suites: [
          {
            title: 'test.spec.ts',
            type: 'file',
            location: { file: 'test.spec.ts', line: 3, column: 1 },
            suites: [
              {
                title: 'Test Suite',
                type: 'describe',
                location: { file: 'test.spec.ts', line: 4, column: 1 },
                suites: [],
                tests: testCases
              }
            ],
            tests: []
          }
        ],
        tests: []
      }
    ],
    tests: []
  };
};

const createMockFullConfig = () => ({
  projects: [{ name: 'Project' }]
});

const createMockFullResult = (status: 'passed' | 'failed' | 'timedOut' | 'interrupted' = 'passed') => ({
  status,
  startTime: new Date(),
  duration: 1000
});

describe('OpenWrightReporter', () => {
  let reporter: OpenWrightReporter;
  let mockApiService: RunReportingApi;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock API service
    mockApiService = {
      createRun: vi.fn().mockResolvedValue(undefined),
      updateRunCaseExecutions: vi.fn().mockResolvedValue(undefined)
    } as unknown as RunReportingApi;
    
    // Create reporter with proper config type
    reporter = new OpenWrightReporter({
      projectId: 'test-project',
      reportingClientKey: 'test-key',
      tenantId: 'test-tenant',
      baseUrl: 'http://localhost:3000',
      updateIntervalMs: 100,
      debugLogging: false,
      apiService: mockApiService
    });
  });

  it('should create reporter instance with default values', () => {
    const reporterWithDefaults = new OpenWrightReporter({
      projectId: 'test-project',
      reportingClientKey: 'test-key',
      tenantId: 'test-tenant',
      baseUrl: 'http://localhost:3000'
    });
    
    expect(reporterWithDefaults).toBeDefined();
  });

  it('printsToStdio should return false', () => {
    expect(reporter.printsToStdio()).toBe(false);
  });

  describe('onBegin', () => {
    it('should create run and start queue processing', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      
      // Capture current time before calling onBegin
      const beforeCallTime = new Date();
      
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      
      expect(mockApiService.createRun).toHaveBeenCalledTimes(1);
      
      // Based on the mock data structure and the implementation of mapSuiteToApi:
      // - Root suite (title: 'Root') isn't sent directly
      // - Project suite (title: 'Project') is sent and used as runGroup
      // - Test Suite (title: 'Test Suite') is pushed into suites array
      // - Test cases are mapped with generated IDs
      
      const createRunArg = (mockApiService.createRun as any).mock.calls[0][0];
      
      // Verify that the run ID is a valid UUID
      expect(isValidUuidV4(createRunArg.id)).toBe(true);
      
      // Verify the start date is after our beforeCallTime
      const startDate = new Date(createRunArg.startDate);
      expect(startDate).toBeInstanceOf(Date);
      expect(startDate.getTime()).toBeGreaterThanOrEqual(beforeCallTime.getTime());
      
      expect(createRunArg).toEqual(expect.objectContaining({
        projectId: 'test-project',
        suites: [
          {
            title: 'Test Suite',
            location: { file: 'test.spec.ts', line: 4, column: 1 },
            cases: expect.arrayContaining([
              expect.objectContaining({
                title: 'Test 1',
                timeout: 30000,
                expectedStatus: TestStatus.Passed
              }),
              expect.objectContaining({
                title: 'Test 2',
                timeout: 30000,
                expectedStatus: TestStatus.Passed
              })
            ]),
            runGroup: 'Project'
          }
        ]
      }));
      
      // Verify that case IDs are valid UUIDs
      createRunArg.suites[0].cases.forEach((caseItem: any) => {
        expect(isValidUuidV4(caseItem.id)).toBe(true);
      });
    });

    it('should handle API error', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      
      // Force API error
      (mockApiService.createRun as any).mockRejectedValueOnce(new Error('API Error'));
      
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      
      // Shouldn't throw, should continue execution
      expect(mockApiService.createRun).toHaveBeenCalledTimes(1);
    });
  });

  describe('onTestBegin', () => {
    it('should queue initial execution state', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      const mockTest = createMockTestCase('test-1', 'Test 1');
      const mockResult = createMockTestResult();
      
      // Setup test case ID mapping
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      
      // Capture the run ID from the createRun call
      const createRunArg = (mockApiService.createRun as any).mock.calls[0][0];
      const expectedRunId = createRunArg.id;
      
      // Test onTestBegin
      await reporter.onTestBegin(mockTest as unknown as TestCase, mockResult as unknown as TestResult);
      
      // Set a short delay to ensure the queue is processed
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify API was called with the correct payload
      expect(mockApiService.updateRunCaseExecutions).toHaveBeenCalled();
      
      // Extract the execution payload from the mock call
      const updateCallArgs = (mockApiService.updateRunCaseExecutions as any).mock.calls[0];
      expect(updateCallArgs).toBeDefined();
      expect(updateCallArgs.length).toBe(2); // runId and payload array
      
      const [reportedRunId, executionPayloads] = updateCallArgs;
      
      // Verify run ID matches the one from createRun
      expect(reportedRunId).toBe(expectedRunId);
      
      // Verify execution payload
      expect(executionPayloads).toBeInstanceOf(Array);
      expect(executionPayloads.length).toBe(1);
      
      const executionPayload = executionPayloads[0];
      expect(executionPayload).toEqual(expect.objectContaining({
        id: expect.any(String),
        startDate: expect.any(String),
        retry: mockResult.retry
      }));
      
      // Verify execution ID is a valid UUID v4
      expect(isValidUuidV4(executionPayload.id)).toBe(true);
      
      // Verify date format
      expect(new Date(executionPayload.startDate).toISOString()).toBe(executionPayload.startDate);
      
      // Verify status is not defined
      expect(executionPayload.status).toBeUndefined();
    });
  });

  describe('onTestEnd', () => {
    it('should send separate API calls when waiting between onTestBegin and onTestEnd', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      const mockTest = createMockTestCase('test-1', 'Test 1');
      const mockBeginResult = createMockTestResult(undefined);
      const mockEndResult = createMockTestEndResult('passed');
      
      // Setup
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      
      // Capture the run ID from the createRun call
      const createRunArg = (mockApiService.createRun as any).mock.calls[0][0];
      const expectedRunId = createRunArg.id;
      
      // Reset mock calls to clearly identify new calls
      (mockApiService.updateRunCaseExecutions as any).mockClear();
      
      // Call onTestBegin
      await reporter.onTestBegin(mockTest as unknown as TestCase, mockBeginResult as unknown as TestResult);
      
      // Wait for the first API call to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify first API call was made with correct data
      expect(mockApiService.updateRunCaseExecutions).toHaveBeenCalledTimes(1);
      
      const firstCallArgs = (mockApiService.updateRunCaseExecutions as any).mock.calls[0];
      expect(firstCallArgs[0]).toBe(expectedRunId);
      expect(firstCallArgs[1]).toBeInstanceOf(Array);
      expect(firstCallArgs[1].length).toBe(1);
      
      const firstPayload = firstCallArgs[1][0];
      expect(isValidUuidV4(firstPayload.id)).toBe(true);
      expect(firstPayload).toEqual(expect.objectContaining({
        startDate: expect.any(String),
        retry: mockBeginResult.retry
      }));
      expect(firstPayload.status).toBeUndefined();
      expect(firstPayload.duration).toBeUndefined();
      expect(firstPayload.stdout).toBeUndefined();
      
      // Store execution ID for later comparison
      const executionId = firstPayload.id;
      
      // Reset mock calls to clearly identify new calls
      (mockApiService.updateRunCaseExecutions as any).mockClear();
      
      // Call onTestEnd
      reporter.onTestEnd(mockTest as unknown as TestCase, mockEndResult as unknown as TestResult);
      
      // Wait for the second API call to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify second API call was made with correct data
      expect(mockApiService.updateRunCaseExecutions).toHaveBeenCalledTimes(1);
      
      const secondCallArgs = (mockApiService.updateRunCaseExecutions as any).mock.calls[0];
      expect(secondCallArgs[0]).toBe(expectedRunId);
      expect(secondCallArgs[1]).toBeInstanceOf(Array);
      expect(secondCallArgs[1].length).toBe(1);
      
      const secondPayload = secondCallArgs[1][0];
      expect(secondPayload.id).toBe(executionId); // Same execution ID
      expect(secondPayload).toEqual(expect.objectContaining({
        duration: mockEndResult.duration,
        status: TestStatus.Passed,
        stdout: mockEndResult.stdout
      }));
      expect(secondPayload.errors).toEqual([]);
    });

    it('should merge updates when onTestBegin and onTestEnd are called in sequence', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      const mockTest = createMockTestCase('test-1', 'Test 1');
      const mockBeginResult = createMockTestResult(undefined);
      const mockEndResult = createMockTestEndResult('failed');
      
      // Setup
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      
      // Capture the run ID from the createRun call
      const createRunArg = (mockApiService.createRun as any).mock.calls[0][0];
      const expectedRunId = createRunArg.id;
      
      // Reset mock calls to clearly identify new calls
      (mockApiService.updateRunCaseExecutions as any).mockClear();
      
      // Call onTestBegin and onTestEnd in sequence
      await reporter.onTestBegin(mockTest as unknown as TestCase, mockBeginResult as unknown as TestResult);
      reporter.onTestEnd(mockTest as unknown as TestCase, mockEndResult as unknown as TestResult);
      
      // Wait for the API call to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify API was called exactly once with merged data
      expect(mockApiService.updateRunCaseExecutions).toHaveBeenCalledTimes(1);
      
      const callArgs = (mockApiService.updateRunCaseExecutions as any).mock.calls[0];
      expect(callArgs[0]).toBe(expectedRunId);
      expect(callArgs[1]).toBeInstanceOf(Array);
      expect(callArgs[1].length).toBe(1);
      
      const payload = callArgs[1][0];
      expect(isValidUuidV4(payload.id)).toBe(true);
      
      // Should have the beginning data
      expect(payload).toEqual(expect.objectContaining({
        startDate: expect.any(String),
        retry: mockBeginResult.retry
      }));
      
      // Should also have the end data
      expect(payload).toEqual(expect.objectContaining({
        duration: mockEndResult.duration,
        status: TestStatus.Failed,
        stdout: mockEndResult.stdout,
        stderr: mockEndResult.stderr
      }));
      
      // Should have error data since we used 'failed' status
      expect(payload.errors).toBeInstanceOf(Array);
      expect(payload.errors.length).toBe(1);
      expect(payload.errors[0]).toEqual(expect.objectContaining({
        message: 'Test error message'
      }));
    });

    it('should queue final execution state', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      const mockTest = createMockTestCase('test-1', 'Test 1');
      const mockBeginResult = createMockTestResult(undefined);
      const mockEndResult = createMockTestEndResult('passed');
      
      // Setup
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      await reporter.onTestBegin(mockTest as unknown as TestCase, mockBeginResult as unknown as TestResult);
      
      // Test onTestEnd
      reporter.onTestEnd(mockTest as unknown as TestCase, mockEndResult as unknown as TestResult);
      
      // Will be tested via processUpdateQueue in onEnd
    });
  });

  describe('onEnd', () => {
    it('should process remaining queue and stop queue processing', async () => {
      const mockSuite = createMockSuite();
      const mockConfig = createMockFullConfig();
      const mockTest = createMockTestCase('test-1', 'Test 1');
      const mockResult = createMockTestResult();
      const mockFullResult = createMockFullResult();
      
      // Setup a complete test flow
      await reporter.onBegin(mockConfig as unknown as FullConfig, mockSuite as unknown as Suite);
      await reporter.onTestBegin(mockTest as unknown as TestCase, mockResult as unknown as TestResult);
      reporter.onTestEnd(mockTest as unknown as TestCase, mockResult as unknown as TestResult);
      
      // Set a short delay to ensure the queue is processed
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Test onEnd
      await reporter.onEnd(mockFullResult as unknown as FullResult);
      
      expect(mockApiService.updateRunCaseExecutions).toHaveBeenCalled();
    });
  });

  describe('onError', () => {
    it('should handle global errors', () => {
      const mockError = new Error('Test Error');
      
      // Should not throw
      reporter.onError(mockError);
    });
  });
}); 