import { Injectable, signal, computed, inject } from '@angular/core';
import { resource } from '@angular/core';
import {
  TimePeriod,
  TestRunApiService,
  TestStatsApiService,
} from '@openwright/data-access';

interface DashboardState {
  refreshTick: number;
  selectedPeriod: TimePeriod;
}

@Injectable()
export class DashboardStore {
  #testRunApi = inject(TestRunApiService);
  #testStatsApi = inject(TestStatsApiService);

  readonly #state = signal<DashboardState>({ refreshTick: 0, selectedPeriod: '7d' });
  readonly selectedPeriod = computed(() => this.#state().selectedPeriod);

  private getResourceRequest() {
      return { tick: this.#state().refreshTick, period: this.selectedPeriod() };
  }
  
  readonly #testRunsResource = resource({
    request: () => this.getResourceRequest(),
    loader: (req) => 
      this.#testRunApi.fetchLatestTestRuns(req.request.period)
  });

  readonly #testStatsResource = resource({
    request: () => this.getResourceRequest(),
    loader: (req) => 
      this.#testStatsApi.fetchTestStats(req.request.period)
  });

  readonly latestRuns = computed(() => this.#testRunsResource.value());
  readonly testStats = computed(() => this.#testStatsResource.value());
  readonly isLoadingRuns = this.#testRunsResource.isLoading;
  readonly isLoadingStats = this.#testStatsResource.isLoading;
  readonly errorRuns = this.#testRunsResource.error;
  readonly errorStats = this.#testStatsResource.error;

  readonly isLoading = computed(() => this.isLoadingRuns() || this.isLoadingStats());

  setPeriod(period: TimePeriod) {
    this.#state.update(s => ({ ...s, selectedPeriod: period }));
  }

  refreshData() {
    this.#state.update(s => ({ ...s, refreshTick: s.refreshTick + 1 }));
  }
}
