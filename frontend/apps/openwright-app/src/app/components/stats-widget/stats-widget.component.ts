import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArrowDown, ArrowUp, LucideAngularModule, Minus } from 'lucide-angular';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

interface TestStatValue {
  value: number | string;
  changePercent?: number;
}

@Component({
  selector: 'ow-stats-widget',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    LucideAngularModule
  ],
  template: `
    <p-card [styleClass]="'shadow-md border-round'">
      <ng-template pTemplate="title">
        <div class="flex items-center" [class]="iconColorClass()">
          @if (icon()) {
            <lucide-icon [img]="icon()" [size]="18" class="mr-2"></lucide-icon>
          }
          <span class="font-semibold">{{ title() }}</span>
        </div>
      </ng-template>
      <ng-template pTemplate="content" class="pt-2">
        @if (loading()) {
          <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
          <p-skeleton height="1rem" width="50%"></p-skeleton>
        } @else {
          <div class="text-3xl font-semibold mb-1">{{ displayValue() }}</div>
          @if (changeText()) {
            <div class="text-sm flex items-center text-muted-color">
              <lucide-icon [img]="changeIcon()" [size]="14" class="mr-1"></lucide-icon>
              <span>{{ changeText() }} vs last period</span>
            </div>
          }
        }
      </ng-template>
    </p-card>
  `,
  styles: [
    `
    :host {
      display: block;
    }
  `,
  ],
  animations: [

  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsWidgetComponent {
  title = input.required<string>();

  statValue = input<TestStatValue | string | number | undefined | null>();

  icon = input<any>();

  iconColorClass = input<string>('text-gray-600');
  loading = input<boolean>(false);

  readonly MinusIcon = Minus;
  readonly ArrowUpIcon = ArrowUp;
  readonly ArrowDownIcon = ArrowDown;

  readonly displayValue = computed(() => {
    const val = this.statValue();
    if (typeof val === 'object' && val !== null && 'value' in val) {
      return val.value ?? '-';
    }

    return val ?? '-';
  });

  readonly changePercent = computed(() => {
    const val = this.statValue();
    return typeof val === 'object' && val !== null && 'changePercent' in val ? val.changePercent : undefined;
  });

  readonly changeText = computed(() => {
    const change = this.changePercent();
    if (change === undefined || change === null) return null;
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  });

  readonly changeIcon = computed((): any => {
    const change = this.changePercent();
    if (change === undefined || change === null || change === 0) return this.MinusIcon;
    return change > 0 ? this.ArrowUpIcon : this.ArrowDownIcon;
  });
}
