import { Injectable } from '@angular/core';
import { TestStats } from '../models/test-stats.model'; 
import { TimePeriod } from '../models/time-period.model';

@Injectable({ providedIn: 'root' })
export class TestStatsApiService {

  // Mock data generation logic remains similar
  async fetchTestStats(period: TimePeriod): Promise<TestStats> {
    console.log(`API: Fetching test stats for period: ${period}`);
    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate delay

    // Base stats (7d) - Use let for reassignment
    let stats: TestStats = {
      total: { value: 94, changePercent: 6.8 },
      passed: { value: 87, changePercent: 2.4 },
      failed: { value: 7, changePercent: 0 },
      skipped: 0,
      avgDurationSec: { value: 248, changePercent: -9.9 },
      passRate: { value: 87 / 94, changePercent: 1.5 },
      history: [
        { date: 'Day 1', passed: 15, failed: 2 }, { date: 'Day 2', passed: 18, failed: 1 },
        { date: 'Day 3', passed: 22, failed: 3 }, { date: 'Day 4', passed: 30, failed: 1 },
        { date: 'Day 5', passed: 25, failed: 0 }, { date: 'Day 6', passed: 28, failed: 1 },
        { date: 'Day 7', passed: 27, failed: 1 },
      ],
      passRateBySuite: [
        { suiteName: 'Login', passRate: 1.0, totalRuns: 10 },
        { suiteName: 'Checkout', passRate: 0.9, totalRuns: 10 },
        { suiteName: 'Profile', passRate: 1.0, totalRuns: 8 },
      ]
    };

    // Modify based on period
    if (period === '30d') {
      stats = { /* ... 30d data ... */ 
         total: { value: 620, changePercent: 12.5 },
         passed: { value: 550, changePercent: 15.1 },
         failed: { value: 45, changePercent: -5.0 },
         skipped: 25,
         avgDurationSec: { value: 195, changePercent: 3.2 },
         passRate: { value: 550 / (620 - 25), changePercent: 2.8 },
         history: [
           { date: 'Week 1', passed: 130, failed: 15 }, { date: 'Week 2', passed: 145, failed: 10 },
           { date: 'Week 3', passed: 160, failed: 8 }, { date: 'Week 4', passed: 155, failed: 12 },
         ],
         passRateBySuite: [
           { suiteName: 'Login', passRate: 0.98, totalRuns: 50 },
           { suiteName: 'Checkout', passRate: 0.92, totalRuns: 50 },
           { suiteName: 'Profile', passRate: 0.99, totalRuns: 40 },
           { suiteName: 'Payments', passRate: 1.0, totalRuns: 30 },
           { suiteName: 'API', passRate: 0.85, totalRuns: 20 },
         ]
      };
    } else if (period === '90d') {
      stats = { /* ... 90d data ... */ 
        total: { value: 1800, changePercent: 18.2 },
        passed: { value: 1650, changePercent: 20.0 },
        failed: { value: 100, changePercent: -3.0 },
        skipped: 50,
        avgDurationSec: { value: 185, changePercent: 1.0 },
        passRate: { value: 1650 / (1800 - 50), changePercent: 3.1 },
        history: [
          { date: 'Month 1', passed: 500, failed: 40 }, { date: 'Month 2', passed: 550, failed: 35 },
          { date: 'Month 3', passed: 600, failed: 25 },
        ],
        passRateBySuite: [
          { suiteName: 'Login', passRate: 0.97, totalRuns: 150 },
          { suiteName: 'Checkout', passRate: 0.94, totalRuns: 150 },
          { suiteName: 'Profile', passRate: 0.98, totalRuns: 120 },
          { suiteName: 'Payments', passRate: 0.99, totalRuns: 90 },
          { suiteName: 'API', passRate: 0.90, totalRuns: 60 },
          { suiteName: 'E2E A', passRate: 0.95, totalRuns: 50 },
          { suiteName: 'E2E B', passRate: 0.88, totalRuns: 40 },
        ]
       };
    } else if (period === 'all') {
       stats = { /* ... all time data ... */ 
            total: { value: 5000, changePercent: 25.0 },
            passed: { value: 4500, changePercent: 28.0 },
            failed: { value: 300, changePercent: -2.0 },
            skipped: 200,
            avgDurationSec: { value: 180, changePercent: -1.5 },
            passRate: { value: 4500 / (5000 - 200), changePercent: 3.5 },
            history: [
                { date: 'Q1', passed: 1000, failed: 100 }, { date: 'Q2', passed: 1200, failed: 80 },
                { date: 'Q3', passed: 1300, failed: 70 }, { date: 'Q4', passed: 1500, failed: 50 },
            ],
            passRateBySuite: [
                { suiteName: 'Login', passRate: 0.96, totalRuns: 500 },
                { suiteName: 'Checkout', passRate: 0.95, totalRuns: 500 },
                { suiteName: 'Profile', passRate: 0.97, totalRuns: 400 },
                { suiteName: 'Payments', passRate: 0.98, totalRuns: 300 },
                { suiteName: 'API', passRate: 0.91, totalRuns: 200 },
                { suiteName: 'E2E A', passRate: 0.94, totalRuns: 150 },
                { suiteName: 'E2E B', passRate: 0.90, totalRuns: 120 },
                 { suiteName: 'Smoke', passRate: 0.99, totalRuns: 100 },
            ]
        };
    }

    return stats;
  }
} 