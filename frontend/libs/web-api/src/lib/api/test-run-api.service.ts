import { Injectable } from '@angular/core';
import { TestRun } from '../models/test-run.model';
import { TimePeriod } from '../models/time-period.model';

@Injectable({ providedIn: 'root' })
export class TestRunApiService {
  // Mock data remains similar for now
  private baseRuns: TestRun[] = [
    {
      id: 'run-1',
      name: 'Login Feature Tests',
      status: 'passed',
      startTime: new Date(Date.now() - 3.6e6),
      duration: 125,
      commitHash: 'a1b2c3d',
      passedCount: 50,
      totalCount: 50,
    },
    {
      id: 'run-2',
      name: 'Checkout Flow Tests',
      status: 'failed',
      startTime: new Date(Date.now() - 7.2e6),
      duration: 182,
      commitHash: 'b4e5f6',
      prNumber: 123,
      passedCount: 45,
      totalCount: 50,
    },
    {
      id: 'run-3',
      name: 'User Profile Tests',
      status: 'passed',
      startTime: new Date(Date.now() - 1.08e7),
      duration: 93,
      commitHash: 'e4f5g6h',
      passedCount: 30,
      totalCount: 30,
    },
    {
      id: 'run-4',
      name: 'Payment Processing',
      status: 'passed',
      startTime: new Date(Date.now() - 8.64e7),
      duration: 211,
      commitHash: 'i7j8k9l',
      passedCount: 60,
      totalCount: 60,
    },
    {
      id: 'run-5',
      name: 'API Integration',
      status: 'skipped',
      startTime: new Date(Date.now() - 1.728e8),
      duration: 65,
      commitHash: 'k0l1m2',
      prNumber: 120,
      passedCount: 0,
      totalCount: 10,
    },
    {
      id: 'run-6',
      name: 'End-to-End Suite A',
      status: 'passed',
      startTime: new Date(Date.now() - 3.456e8),
      duration: 450,
      commitHash: 'm0n1o2p',
      passedCount: 100,
      totalCount: 100,
    },
    {
      id: 'run-7',
      name: 'End-to-End Suite B',
      status: 'failed',
      startTime: new Date(Date.now() - 6.048e8),
      duration: 510,
      commitHash: 'q3r4s5t',
      prNumber: 115,
      passedCount: 90,
      totalCount: 105,
    },
  ];

  async fetchLatestTestRuns(period: TimePeriod): Promise<TestRun[]> {
    console.log(`API: Fetching latest test runs for period: ${period}`);
    await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate delay

    // Apply filtering based on period
    if (period === '7d') return [...this.baseRuns].slice(0, 3);
    if (period === '30d') return [...this.baseRuns].slice(0, 5);
    if (period === '90d') return [...this.baseRuns].slice(0, 6);
    return [...this.baseRuns]; // 'all' - return a copy
  }

  // Add other methods later, e.g., fetchTestRunById(id: string)
}
