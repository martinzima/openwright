import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { fadeInAnimation } from '@openwright/ui-common';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  selector: 'ow-login-page',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
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
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    explicitEffect([this.authService.isAuthenticated], ([isAuthenticated]) => {
      if (isAuthenticated) {
        if (!this.authService.user()) {
          this.router.navigate(['/create-account']);
        } else {
          const roleGrants = this.authService.roleGrants();
          if (roleGrants && roleGrants.length > 0) {
            this.router.navigate(['/', roleGrants[0].organization.urlSlug, 'dashboard']);
          } else {
            this.router.navigate(['/create-organization']);
          }
        }
      }
    });
  }

  loginWithGoogle() {
    location.href = '/api/auth/login/google?redirectUrl=/_/dashboard';
  }
}