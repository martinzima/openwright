import { TestError } from './test-error';
import { TestStatus } from './test-status';

export interface UpsertCaseExecutionPayload {
  id: string;
  startDate?: string;
  duration?: number;
  retry?: number;
  status?: TestStatus;
  errors?: TestError[];
  stdout?: string[];
  stderr?: string[];
}

export type UpsertCaseExecutionsPayload = UpsertCaseExecutionPayload[]; 