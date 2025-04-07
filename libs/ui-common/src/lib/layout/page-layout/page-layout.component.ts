import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'ow-page-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 p-4 md:p-6 lg:p-8" @pageAnimation>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6" @headerAnimation>
        <h2 class="text-3xl font-semibold text-gray-800">{{ title }}</h2>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      
      <ng-content></ng-content>
    </div>
  `,
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLayoutComponent {
  @Input() title = '';
} 