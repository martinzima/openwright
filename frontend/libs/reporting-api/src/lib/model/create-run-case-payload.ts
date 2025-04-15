import { TestStatus } from './test-status';

export interface CreateRunCasePayload {
  id: string;
  title?: string;
  tags?: string[];
  timeout?: number;
  retries?: number;
  annotations?: { type: string; description?: string }[];
  expectedStatus?: TestStatus;
} 