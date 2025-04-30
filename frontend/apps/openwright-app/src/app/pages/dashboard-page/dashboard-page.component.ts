import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimePeriod } from '@openwright/web-api';
import { PageLayoutComponent } from '@openwright/ui-common';
import { CheckCircle, Hash, Timer, XCircle } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { StatsWidgetComponent } from '../../components/stats-widget/stats-widget.component';
import { DashboardStore } from './dashboard-store.service';
import { PassRateChartComponent } from './pass-rate-chart/pass-rate-chart.component';
import { TestRunListComponent } from './test-run-list/test-run-list.component';
import { TestStatsChartComponent } from './test-stats-chart/test-stats-chart.component';

function formatDuration(totalSeconds: number | undefined): string {
  if (totalSeconds === undefined || totalSeconds === null || totalSeconds < 0) {
    return '-';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

@Component({
  selector: 'ow-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TestRunListComponent,
    TestStatsChartComponent,
    PassRateChartComponent,
    StatsWidgetComponent,
    PageLayoutComponent,
    SkeletonModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
  ],
  template: `
    <ow-page-layout title="Dashboard">
      <ng-container actions>
        <p-select
          [options]="timePeriodOptions"
          [(ngModel)]="selectedTimePeriod"
          (onChange)="onPeriodChange($event.value)"
          optionLabel="label"
          optionValue="value"
          [style]="{ minWidth: '150px' }"
          styleClass="p-inputtext-sm"
        />
        <p-button
          icon="pi pi-refresh"
          (click)="refresh()"
          pTooltip="Refresh Data"
          tooltipPosition="bottom"
          [loading]="isLoading()"
          size="small">
        </p-button>
      </ng-container>

      <ng-template>
        <div class="flex flex-col gap-6">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            @widgetsAnimation
          >
            <ow-stats-widget
              class="widget"
              title="Total Tests"
              [statValue]="testStats()?.total"
              [icon]="HashIcon"
              iconColorClass="text-blue-500"
              [loading]="store.isLoadingStats()"
            />
            <ow-stats-widget
              class="widget"
              title="Passing Tests"
              [statValue]="testStats()?.passed"
              [icon]="CheckCircleIcon"
              iconColorClass="text-green-500"
              [loading]="store.isLoadingStats()"
            />
            <ow-stats-widget
              class="widget"
              title="Failing Tests"
              [statValue]="testStats()?.failed"
              [icon]="XCircleIcon"
              iconColorClass="text-red-500"
              [loading]="store.isLoadingStats()"
            />
            <ow-stats-widget
              class="widget"
              title="Avg. Duration"
              [statValue]="avgDurationFormatted()"
              [icon]="TimerIcon"
              iconColorClass="text-purple-500"
              [loading]="store.isLoadingStats()"
            />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ow-test-stats-chart class="widget" />
            <ow-pass-rate-chart class="widget" />
          </div>

          <div>
            <ow-test-run-list class="widget" />
          </div>
        </div>
      </ng-template>
    </ow-page-layout>
  `,
  animations: [
    trigger('widgetsAnimation', [
      transition(':enter', [
        query(
          '.widget',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardStore],
})
export class DashboardPageComponent {
  readonly store = inject(DashboardStore);

  readonly selectedPeriod = this.store.selectedPeriod;
  readonly latestRuns = this.store.latestRuns;
  readonly testStats = this.store.testStats;
  readonly isLoading = this.store.isLoading;

  readonly HashIcon = Hash;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly TimerIcon = Timer;

  open = signal(true);

  readonly timePeriodOptions = [
    { label: 'Last 7 days', value: '7d' as TimePeriod },
    { label: 'Last 30 days', value: '30d' as TimePeriod },
    { label: 'Last 90 days', value: '90d' as TimePeriod },
    { label: 'All time', value: 'all' as TimePeriod },
  ];

  selectedTimePeriod: TimePeriod = this.selectedPeriod();

  onPeriodChange(newPeriod: TimePeriod | null) {
    if (newPeriod) {
      this.store.setPeriod(newPeriod);
      this.selectedTimePeriod = this.selectedPeriod();
    }
  }

  refresh() {
    this.store.refreshData();
  }

  readonly avgDurationFormatted = computed(() => {
    const stat = this.testStats()?.avgDurationSec;
    if (!stat) return undefined;
    return {
      value: formatDuration(stat.value),
      changePercent: stat.changePercent,
    };
  });
}
