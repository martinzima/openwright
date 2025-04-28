import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'ow-not-found-page',
  template: `
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-2xl font-bold">404</h1>
      <p class="text-gray-500">Page not found</p>

      <p-button label="Go to home" class="mt-4" [routerLink]="['/']" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    RouterLink
  ]
})
export class NotFoundPageComponent {
}