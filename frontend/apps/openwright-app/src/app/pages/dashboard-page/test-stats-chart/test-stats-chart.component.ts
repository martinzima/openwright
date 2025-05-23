import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardStore } from '../dashboard-store.service';

@Component({
  selector: 'ow-test-stats-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, SkeletonModule, CardModule],
  template: `
    <p-card styleClass="shadow-md">
      <ng-template pTemplate="title">
        <span class="font-semibold">Test Run History</span>
      </ng-template>
      <ng-template pTemplate="content">
        @if (store.isLoadingStats()) {
          <p-skeleton height="200px"></p-skeleton>
        } @else if (chartData() && chartData()?.labels?.length) {
          <p-chart type="line" [data]="chartData()" [options]="chartOptions()"
            height="200" />
        } @else {
          <div class="text-center text-muted-color py-4">
            No historical data available for this period.
          </div>
        }
      </ng-template>
    </p-card>
  `,
  styles: [
    `
    :host {
        display: block;
    }

    p-chart {
      height: 100%;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestStatsChartComponent {
  readonly store = inject(DashboardStore);

  readonly chartData = computed(() => {
    const stats = this.store.testStats();
    if (!stats?.history) {
      return undefined;
    }

    let passedColor = '#10b981';
    let failedColor = '#ef4444';
    try {
      const documentStyle = getComputedStyle(document.documentElement);
      passedColor = documentStyle.getPropertyValue('--p-green-500') || passedColor;
      failedColor = documentStyle.getPropertyValue('--p-red-500') || failedColor;
    } catch (e) { }

    return {
      labels: stats.history.map(h => h.date),
      datasets: [
        {
          label: 'Passed',
          data: stats.history.map(h => h.passed),
          fill: true,
          borderColor: passedColor,
          tension: 0.4,
          backgroundColor: `${passedColor}33`
        },
        {
          label: 'Failed',
          data: stats.history.map(h => h.failed),
          fill: true,
          borderColor: failedColor,
          tension: 0.4,
          backgroundColor: `${failedColor}33`
        }
      ]
    };
  });

  readonly chartOptions = computed(() => {
    let textColor = '#495057';
    let textColorSecondary = '#6c757d';
    let surfaceBorder = '#dee2e6';
    try {
      const documentStyle = getComputedStyle(document.documentElement);
      textColor = documentStyle.getPropertyValue('--text-color') || textColor;
      textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || textColorSecondary;
      surfaceBorder = documentStyle.getPropertyValue('--surface-border') || surfaceBorder;
    } catch (e) { }

    return {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Tests Count',
            color: textColorSecondary
          }
        }
      }
    };
  });
}
