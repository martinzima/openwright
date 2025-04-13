import { CreateRunCasePayload } from './create-run-case-payload';
import { TestLocation } from './test-location';

export interface CreateRunSuitePayload {
  title: string | null;
  location?: TestLocation;
  runGroup?: string;
  suites?: CreateRunSuitePayload[];
  cases?: CreateRunCasePayload[];
}