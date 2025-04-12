import { ActorInfo } from './actor-info';
import { CommitInfo } from './commit-info';
import { CreateRunSuite } from './create-run-suite';

export interface CreateRunPayload {
  id: string;
  projectId: string;
  startDate: string;
  duration?: number;
  description?: string;
  pullRequestNumber?: number;
  commit?: CommitInfo;
  actor?: ActorInfo;
  rootSuite: CreateRunSuite;
} 