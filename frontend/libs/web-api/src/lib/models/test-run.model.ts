export interface TestRun {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  startTime: Date;
  duration: number; // in seconds
  commitHash?: string;
  prNumber?: number;
  passedCount?: number;
  totalCount?: number;
}
