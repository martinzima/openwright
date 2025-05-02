import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateAccountStore } from './create-account.store';
import { MessageModule } from 'primeng/message';
import { CreateMyUserPayload } from '@openwright/web-api';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { RequestErrorPipe } from '@openwright/ui-common';

interface CreateAccountModel {
  email?: string;
  firstName?: string;
  lastName?: string;
}

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

  form = new FormGroup({});
  model: CreateAccountModel = {};
  fields: FormlyFieldConfig[] = [
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
    explicitEffect([this.authService.isAuthenticated], ([isAuthenticated]) => {
      if (isAuthenticated) {
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
      if (me?.emailAddress) {
        this.model = { ...this.model, email: me.emailAddress };
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.submit(this.form.value as CreateMyUserPayload);
  }

  logout() {
    this.authService.logout();
  }
}