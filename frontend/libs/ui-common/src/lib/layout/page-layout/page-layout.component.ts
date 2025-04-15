import { animate, style, transition, trigger } from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'ow-page-layout',
  imports: [
    NgTemplateOutlet
  ],
  template: `
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-6
      md:p-8 lg:p-10 bg-slate-200 border-b border-gray-300">
      <h2 class="text-4xl font-bold text-gray-700"
        @headerAnimation>
        {{title()}}
      </h2>

      <div class="flex items-center gap-2"
        @headerAnimation>
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>

    <div class="flex-grow p-4 md:p-6 lg:p-8">
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