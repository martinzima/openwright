import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateAccountStore } from './create-account.store';
import { MessageModule } from 'primeng/message';
import { FormlyModule } from '@ngx-formly/core';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { CommonFormComponent } from '@openwright/ui-common';

@Component({
  selector: 'ow-create-account-page',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    FormlyModule,
    LucideAngularModule,
    CommonFormComponent
  ],
  providers: [
    CreateAccountStore
  ],
})
export class CreateAccountPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly store = inject(CreateAccountStore);

  readonly ArrowRightIcon = ArrowRight;

  constructor() {
    explicitEffect([this.authService.me], ([me]) => {
      if (this.authService.isAuthenticated()) {
        if (this.authService.user()) {
          const roleGrants = this.authService.roleGrants();
          if (roleGrants && roleGrants.length > 0) {
            this.router.navigate(['/', roleGrants[0].organization.urlSlug, 'dashboard']);
          } else {
            this.router.navigate(['/create-organization']);
          }
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}