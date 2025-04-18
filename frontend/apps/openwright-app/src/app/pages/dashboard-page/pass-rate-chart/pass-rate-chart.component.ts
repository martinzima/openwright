import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PassRateBySuite } from '@openwright/data-access';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardStore } from '../dashboard-store.service';

@Component({
  selector: 'ow-pass-rate-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, SkeletonModule, CardModule],
  template: `
    <p-card styleClass="shadow-md">
      <ng-template pTemplate="title">
        <span class="font-semibold">Pass Rate by Suite</span>
      </ng-template>
      <ng-template pTemplate="content" styleClass="flex flex-col">
        @if (store.isLoadingStats()) {
          <p-skeleton height="200px" styleClass="flex-grow"></p-skeleton>
        } @else if (chartData() && chartData()?.labels?.length) {
          <div class="relative flex-grow h-full">
            <p-chart type="bar" [data]="chartData()" [options]="chartOptions()"
              height="200" />
          </div>
        } @else {
          <div class="text-center text-muted-color py-4 flex-grow flex items-center justify-center">
            No suite data available for this period.
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
export class PassRateChartComponent {
  private document = inject(DOCUMENT);

  readonly store = inject(DashboardStore);

  readonly chartData = computed(() => {
    const suiteData = this.store.testStats()?.passRateBySuite;
    if (!suiteData || suiteData.length === 0) {
      return undefined;
    }

    const sortedData = [...suiteData].sort((a, b) => a.suiteName.localeCompare(b.suiteName));

    let blueColor = '#42A5F5';
    let greenColor = '#66BB6A';
    let orangeColor = '#FFA726';
    let tealColor = '#26A69A';
    let purpleColor = '#AB47BC';
    let pinkColor = '#EC407A';
    let grayColor = '#78909C';
    let indigoColor = '#5C6BC0';

    if (this.document && typeof getComputedStyle === 'function') {
      const documentStyle = getComputedStyle(document.documentElement);

      if (documentStyle) {
        blueColor = documentStyle.getPropertyValue('--p-blue-500') || blueColor;
        greenColor = documentStyle.getPropertyValue('--p-green-500') || greenColor;
        orangeColor = documentStyle.getPropertyValue('--p-orange-500') || orangeColor;
        tealColor = documentStyle.getPropertyValue('--p-teal-500') || tealColor;
        purpleColor = documentStyle.getPropertyValue('--p-purple-500') || purpleColor;
        pinkColor = documentStyle.getPropertyValue('--p-pink-500') || pinkColor;
        grayColor = documentStyle.getPropertyValue('--p-gray-500') || grayColor;
        indigoColor = documentStyle.getPropertyValue('--p-indigo-500') || indigoColor;
      }
    }

    const chartColors = [
      blueColor,
      greenColor,
      orangeColor,
      tealColor,
      purpleColor,
      pinkColor,
      grayColor,
      indigoColor
    ];

    const backgroundColors = sortedData.map((_, index) => chartColors[index % chartColors.length]);

    return {
      labels: sortedData.map(s => s.suiteName),
      datasets: [
        {
          label: 'Pass Rate',
          data: sortedData.map(s => s.passRate),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }
      ]
    };
  });

  readonly chartOptions = computed(() => this.getChartOptions(this.store));

  private getChartOptions(store: DashboardStore) {
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
      aspectRatio: 1.6,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) { label += ': '; }

              if (context.parsed.y !== null) {
                label += (context.parsed.y * 100).toFixed(1) + '%';
              }

              const originalData = store.testStats()?.passRateBySuite.find((s: PassRateBySuite) => s.suiteName === context.label);
              if (originalData) {
                label += ` (${originalData.totalRuns} runs)`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          max: 1,
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            format: { style: 'percent' }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
}