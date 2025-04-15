import { TestStatValue } from './test-stat-value.model';
import { PassRateBySuite } from './pass-rate-by-suite.model';

export interface TestStats {
  total: TestStatValue;
  passed: TestStatValue;
  failed: TestStatValue;
  skipped: number;
  avgDurationSec: TestStatValue;
  passRate: TestStatValue;
  history: { date: string, passed: number, failed: number }[];
  passRateBySuite: PassRateBySuite[];
} 