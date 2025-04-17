import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { fadeInAnimation } from '@openwright/ui-common';

@Component({
  selector: 'ow-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    RouterLink
  ],
  animations: [fadeInAnimation],
  host: {
    '[@fadeIn]': ''
  }
})
export class LoginPageComponent {

}