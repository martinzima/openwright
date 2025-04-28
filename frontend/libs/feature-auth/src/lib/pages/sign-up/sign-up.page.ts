import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'ow-sign-up-page',
  templateUrl: './sign-up.page.html',
  styleUrl: './sign-up.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    RouterLink
  ]
})
export class SignupPageComponent {
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

  signUpWithGoogle() {
    location.href = '/api/auth/login/google?redirectUrl=/create-account'
  }
}