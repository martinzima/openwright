import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ow-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h2 class="text-3xl font-semibold text-gray-800">{{ title }}</h2>
      <div class="flex items-center gap-2">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  @Input() title = '';
} 