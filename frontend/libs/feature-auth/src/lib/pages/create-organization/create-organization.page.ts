import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AbstractControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { OrganizationsApiService } from '@openwright/web-api';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { CreateOrganizationStore } from './create-organization.store';
import { RequestErrorPipe } from '@openwright/ui-common';
import { AuthService } from '@openwright/app-shell-auth';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { map, Observable, of, take } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'ow-create-organization-page',
  templateUrl: './create-organization.page.html',
  styleUrls: ['./create-organization.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    FormlyModule,
    RequestErrorPipe,
    LucideAngularModule,
    InputTextModule
  ],
  providers: [CreateOrganizationStore],
})
export class CreateOrganizationPageComponent {
  readonly store = inject(CreateOrganizationStore);

  private readonly authService = inject(AuthService);
  private readonly organizationsApiService = inject(OrganizationsApiService);
  private readonly router = inject(Router);

  readonly ArrowRightIcon = ArrowRight;

  readonly form = new FormGroup({});

  readonly fields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: {
        label: 'Name',
        placeholder: 'Enter your organization name',
        required: true,
        minLength: 4,
        maxLength: 100,
      },
      expressions: {
         'model.urlSlug': (field) => this.generateSlug(field.model.name)
      }
    },
    {
      key: 'urlSlug',
      type: 'input',
      props: {
        label: 'URL Slug',
        placeholder: 'Unique URL slug for your organization',
        required: true,
        minLength: 4,
        maxLength: 25,
        pattern: /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      },
      asyncValidators: {
        slugTaken: {
          expression: (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value || control.invalid) {
              return of(null);
            }
            return this.organizationsApiService.checkIsOrganizationUrlSlugAvailable(control.value).pipe(
              map((isAvailable) => (isAvailable ? null : { slugTaken: true })),
              take(1)
            );
          },
          message: 'This URL slug is already taken.',
        },
      },
      validation: {
        messages: {
          pattern: 'Invalid URL slug. Only lowercase a-z, 0-9 and dash are allowed.',
        },
      },
    },
  ];

  constructor() {
    explicitEffect([this.authService.me], ([me]) => {
      if (this.authService.isAuthenticated()) {
        if (!this.authService.user()) {
          this.router.navigate(['/create-account']);
        }
      } else {
        this.router.navigate(['/login']);
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

  private generateSlug(name: string): string {
    if (!name) {
      return '';
    }
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-{2,}/g, '-') // Replace multiple dashes with single dash
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
  }
}