import { animate, style, transition, trigger } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'ow-page-layout',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  template: `
    <div class="space-y-6 p-4 md:p-6 lg:p-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6" @headerAnimation>
        <h2 class="text-4xl font-semibold text-gray-800">{{ title() }}</h2>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <ng-container *ngTemplateOutlet="contentTemplate()!"></ng-container>
    </div>
  `,
  animations: [
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLayoutComponent {
  title = input('');
  contentTemplate = contentChild(TemplateRef);
} 