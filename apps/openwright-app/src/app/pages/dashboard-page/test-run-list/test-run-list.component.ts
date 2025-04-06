import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MeterGroupModule, MeterItem } from 'primeng/metergroup';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardStore } from '../dashboard-store.service';
import { TestRun } from '@openwright/data-access';
import { TimeAgoPipe } from '@openwright/ui-common';
import { LucideAngularModule, GitCommitHorizontal, GitPullRequest, CheckCircle, XCircle, SkipForward, HelpCircle, Eye } from 'lucide-angular';

function formatRunDuration(totalSeconds: number | undefined): string {
  if (totalSeconds === undefined || totalSeconds === null || totalSeconds < 0) {
    return '-';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

@Component({
  selector: 'ow-test-run-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    TagModule,
    CardModule,
    MeterGroupModule,
    TooltipModule,
    ButtonModule,
    TimeAgoPipe,
    LucideAngularModule,
    SkeletonModule
  ],
  template: `
    <p-card styleClass="shadow-md">
      <ng-template pTemplate="title">
         <div class="flex justify-between items-center">
           <span class="font-semibold text-gray-700">Recent Test Runs</span>
           <a routerLink="/runs" class="text-sm text-blue-600 hover:underline">View all</a>
         </div>
      </ng-template>
      <ng-template pTemplate="content">
        <p-table 
          [value]="store.latestRuns() || []" 
          [loading]="store.isLoadingRuns()" 
          responsiveLayout="scroll"
          styleClass="p-datatable-sm" 
          [scrollable]="true" 
          scrollHeight="400px" >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 35%">Test Suite / Run</th>
              <th style="width: 10%">Status</th>
              <th style="width: 15%">Run Date</th>
              <th style="width: 10%">Duration</th>
              <th style="width: 20%">Tests</th> 
              <th style="width: 10%">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-run>
            <tr> 
              <td>
                <div class="font-medium text-gray-800 mb-1">{{ run.name }}</div>
                <div class="flex items-center space-x-3 text-xs">
                  @if(run.commitHash) {
                    <a [href]="'https://github.com/commits/' + run.commitHash" 
                        target="_blank" 
                        class="flex items-center text-gray-500 hover:text-blue-600" 
                        (click)="$event.stopPropagation()"
                        pTooltip="Commit: {{run.commitHash}}"
                        tooltipPosition="top">
                        <lucide-icon [img]="CommitIcon" size="14" class="mr-1"></lucide-icon> 
                        <span>{{ run.commitHash.substring(0,7) }}</span>
                    </a>
                  }
                  @if(run.prNumber) {
                    <a [href]="'https://github.com/pull/' + run.prNumber" 
                        target="_blank" 
                        class="flex items-center text-gray-500 hover:text-blue-600"
                        (click)="$event.stopPropagation()"
                        pTooltip="PR: #{{run.prNumber}}"
                        tooltipPosition="top"> 
                        <lucide-icon [img]="GitPullRequestIcon" size="14" class="mr-1"></lucide-icon> 
                        <span>#{{ run.prNumber }}</span>
                    </a>
                  }
                </div>
              </td>
              <td>
                 <p-tag [severity]="getSeverity(run.status)">
                     <div class="flex items-center">
                        <lucide-icon [img]="getStatusIcon(run.status)" [size]="12" class="mr-1"></lucide-icon>
                        <span>{{run.status}}</span>
                    </div>
                 </p-tag>
              </td>
              <td pTooltip="{{ run.startTime | date: 'medium' }}" tooltipPosition="top">
                  {{ run.startTime | timeAgo }}
              </td>
              <td>{{ formatDuration(run.duration) }}</td>
              <td>
                @if(run.passedCount !== undefined && run.totalCount !== undefined && run.totalCount > 0) {
                  <p-meterGroup 
                    [value]="calculateMeterData(run)"
                    [style]="{ width: '100%' }" 
                   />
                } @else {
                   <span class="text-gray-400">N/A</span>
                }
              </td>
              <td class="text-center">
                 <button 
                    pButton 
                    type="button"
                    [routerLink]="['/runs', run.id]" 
                    pTooltip="View Details" 
                    tooltipPosition="left"
                    class="p-button-text p-button-sm p-button-rounded">
                    <lucide-icon [img]="EyeIcon" size="16"></lucide-icon>
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-4 text-gray-500">No test runs found for this period.</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }
    :host ::ng-deep .p-card .p-card-content {
      padding: 0;
    }
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background-color: var(--surface-ground);
      font-weight: 600;
      color: var(--text-color-secondary);
      border-bottom: 1px solid var(--surface-border);
      padding: 0.5rem 0.75rem;
    }
     :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
       padding: 0.6rem 0.75rem; /* Slightly increase vertical padding */
       vertical-align: middle; /* Center content vertically */
     }
     /* Ensure icons in links are vertically aligned */
     td a lucide-icon, td button lucide-icon {
        vertical-align: middle;
     }
     /* Style for MeterGroup labels (use tooltip now mostly) */
     :host ::ng-deep .p-metergroup-label-end .p-metergroup-label {
        font-size: 0.8rem;
        margin-left: 0.5rem;
        display: none; /* Hide default label, we show it in tooltip */
     }
     /* Add tooltips to meter segments */
      :host ::ng-deep .p-metergroup-meters .p-metergroup-meter {
          cursor: default;
      }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestRunListComponent {
  readonly store = inject(DashboardStore);
  formatDuration = formatRunDuration;

  readonly CommitIcon = GitCommitHorizontal;
  readonly GitPullRequestIcon = GitPullRequest;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly SkipForwardIcon = SkipForward;
  readonly HelpCircleIcon = HelpCircle;
  readonly EyeIcon = Eye;

  getSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'danger';
      case 'skipped': return 'warn';
      default: return 'info';
    }
  }

  getStatusIcon(status: string): any {
    switch (status) {
      case 'passed': return this.CheckCircleIcon;
      case 'failed': return this.XCircleIcon;
      case 'skipped': return this.SkipForwardIcon;
      default: return this.HelpCircleIcon;
    }
  }

  calculateMeterData(run: TestRun): MeterItem[] {
    if (run.passedCount === undefined || run.totalCount === undefined || run.totalCount <= 0) {
      return [];
    }
    const passed = Math.max(0, run.passedCount ?? 0);
    const total = Math.max(0, run.totalCount ?? 0);
    const skippedCount = run.status === 'skipped' ? (total - passed > 0 ? 1 : 0) : 0; // Crude skipped logic adjustment
    const failedCount = Math.max(0, total - passed - skippedCount);

    const data = [];
    if (skippedCount > 0) {
      data.push({ label: `Skipped: ${skippedCount}`, color: 'var(--p-yellow-500)', value: skippedCount });
    }
    if (failedCount > 0) {
      data.push({ label: `Failed: ${failedCount}`, color: 'var(--p-red-500)', value: failedCount });
    }
    if (passed > 0) {
      data.push({ label: `Passed: ${passed}`, color: 'var(--p-green-500)', value: passed });
    }

    return data;
  }
}
