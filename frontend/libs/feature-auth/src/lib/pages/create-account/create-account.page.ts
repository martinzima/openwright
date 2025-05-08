import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateAccountStore } from './create-account.store';
import { MessageModule } from 'primeng/message';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { RequestErrorPipe } from '@openwright/ui-common';

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
    RequestErrorPipe
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

  readonly form = new FormGroup({});

  readonly fields: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email',
        required: true,
        disabled: true
      },
    },
    {
      key: 'firstName',
      type: 'input',
      props: {
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        minLength: 2,
      }
    },
    {
      key: 'lastName',
      type: 'input',
      props: {
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
        minLength: 2,
      }
    },
  ];

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

    effect(() => {
      const me = this.authService.me();
      if (me?.tempAuthentication) {
        this.store.updateModel({
          email: me.tempAuthentication?.emailAddress || '',
            firstName: me.tempAuthentication?.firstName || '',
            lastName: me.tempAuthentication?.lastName || ''
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.submit();
  }

  logout() {
    this.authService.logout();
  }
}