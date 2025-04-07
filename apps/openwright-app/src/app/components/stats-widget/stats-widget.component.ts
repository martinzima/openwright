import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, Minus, ArrowUp, ArrowDown } from 'lucide-angular';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
    <p-card [styleClass]="'shadow-md hover:shadow-lg transition-shadow duration-300 border-round'" @widgetAnimation>
      <ng-template pTemplate="title">
        <div class="flex items-center" [class]="iconColorClass()">
          @if (icon()) {
            <lucide-icon [img]="icon()" [size]="18" class="mr-2"></lucide-icon>
          }
          <span class="font-medium">{{ title() }}</span>
        </div>
      </ng-template>
      <ng-template pTemplate="content" class="pt-2">
        @if (loading()) {
          <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
          <p-skeleton height="1rem" width="50%"></p-skeleton>
        } @else {
          <div class="text-3xl font-semibold text-gray-800 mb-1">{{ displayValue() }}</div>
          @if (changeText()) {
            <div class="text-sm flex items-center" [ngClass]="changeClass()">
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
    .text-positive { color: var(--greden-600); }
    .text-negative { color: var(--red-600); }
    .text-neutral { color: var(--gray-500); }
  `,
  ],
  animations: [
    trigger('widgetAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
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

  readonly changeClass = computed(() => {
    const change = this.changePercent();
    if (change === undefined || change === null || change === 0) return 'text-neutral';
    return change > 0 ? 'text-positive' : 'text-negative';
  });
}
