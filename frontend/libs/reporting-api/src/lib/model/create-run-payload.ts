import { ActorInfo } from './actor-info';
import { CommitInfo } from './commit-info';
import { CreateRunSuitePayload } from './create-run-suite-payload';

export interface CreateRunPayload {
  id: string;
  projectId: string;
  startDate: string;
  suites: CreateRunSuitePayload[];
  description?: string;
  pullRequestNumber?: number;
  commit?: CommitInfo;
  actor?: ActorInfo;
}