import { CreateRunCasePayload } from './create-run-case-payload';
import { TestLocation } from './test-location';

export interface CreateRunSuite {
  title?: string;
  location?: TestLocation;
  runGroup?: string | null;
  suites?: CreateRunSuite[];
  cases?: CreateRunCasePayload[];
}