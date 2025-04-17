import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'ow-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    RouterLink,
    FloatLabelModule,
    InputTextModule,
    PasswordModule
  ]
})
export class SignupPageComponent {

}