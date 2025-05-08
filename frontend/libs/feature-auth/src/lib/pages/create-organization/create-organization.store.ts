import { inject, Injectable } from '@angular/core';
import { OrganizationsApiService } from '@openwright/web-api';
import { lastValueFrom, map, Observable, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { generateUuidV4 } from '@openwright/shared-utils';
import { FormStoreBase } from '@openwright/ui-common';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '@openwright/app-shell-auth';

export interface CreateOrganizationModel {
  name: string;
  urlSlug: string;
}

@Injectable()
export class CreateOrganizationStore extends FormStoreBase<CreateOrganizationModel> {
  private readonly authService = inject(AuthService);
  private readonly organizationsApiService = inject(OrganizationsApiService);
  private readonly router = inject(Router);

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

  protected override async doSubmit(model: CreateOrganizationModel): Promise<void> {
    await lastValueFrom(this.organizationsApiService.createOrganization({
      ...model,
      id: generateUuidV4()
    }));
  }

  protected override createEmptyModel(): CreateOrganizationModel {
    return {
      name: '',
      urlSlug: ''
    };
  }

  protected override async afterSubmitSuccess(model: CreateOrganizationModel) {
    await this.authService.refreshMe();
    this.router.navigate(['/', model.urlSlug, 'dashboard']);
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