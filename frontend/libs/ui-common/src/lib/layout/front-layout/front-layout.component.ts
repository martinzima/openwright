import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SvgIconComponent } from '@ngneat/svg-icon';

@Component({
  selector: 'ow-front-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SvgIconComponent,
    RouterLink
  ],
  templateUrl: './front-layout.component.html',
  styleUrls: ['./front-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('headerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FrontLayoutComponent {
  currentYear = new Date().getFullYear();
}