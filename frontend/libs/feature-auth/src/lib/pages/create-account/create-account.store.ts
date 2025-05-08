import { inject, Injectable } from '@angular/core';
import { MeApiService } from '@openwright/web-api';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@openwright/app-shell-auth';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormStoreBase } from '@openwright/ui-common';
import { explicitEffect } from 'ngxtension/explicit-effect';

export interface CreateAccountModel {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class CreateAccountStore extends FormStoreBase<CreateAccountModel> {
  private readonly meApiService = inject(MeApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    super();

    explicitEffect([this.authService.me], ([me]) => {
      if (me?.tempAuthentication) {
        this.updateModel({
          email: me.tempAuthentication?.emailAddress || '',
            firstName: me.tempAuthentication?.firstName || '',
            lastName: me.tempAuthentication?.lastName || ''
        });
      }
    });
  }

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

  protected override async doSubmit(model: CreateAccountModel): Promise<void> {
    await lastValueFrom(this.meApiService.createMyUser({
      ...model
    }));
  }

  protected override createEmptyModel(): CreateAccountModel {
    return {
      email: '',
      firstName: '',
      lastName: ''
    };
  }

  protected override async afterSubmitSuccess(model: CreateAccountModel) {
    await this.authService.refreshMe();
    this.router.navigate(['/create-organization']);
  }
}