import { Annotation } from './annotation';
import { TestLocation } from './test-location';
import { TestStatus } from './test-status';

export interface CreateRunCasePayload {
  id: string;
  title: string;
  location?: TestLocation;
  tags?: string[];
  timeout?: number;
  retries?: number;
  annotations?: Annotation[];
  expectedStatus?: TestStatus;
}
