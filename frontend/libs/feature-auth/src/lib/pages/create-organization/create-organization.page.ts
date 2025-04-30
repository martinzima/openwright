import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CreateMyUserPayload } from '@openwright/web-api';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { CreateOrganizationStore } from './create-organization.store';

@Component({
  selector: 'ow-create-organization-page',
  templateUrl: './create-organization.page.html',
  styleUrls: ['./create-organization.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    RouterLink,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    FormlyModule,
    FormlyPrimeNGModule
  ],
  providers: [CreateOrganizationStore],
})
export class CreateOrganizationPageComponent {
  readonly store = inject(CreateOrganizationStore);

  form = new FormGroup({});
  model = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'firstName',
      type: 'input',
      props: {
        label: 'First name',
        placeholder: 'Enter your first name',
        required: true,
        minLength: 2,
      }
    },
    {
      key: 'lastName',
      type: 'input',
      props: {
        label: 'Last name',
        placeholder: 'Enter your last name',
        required: true,
        minLength: 2,
      }
    },
  ];

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.submit(this.form.value as CreateMyUserPayload);
  }
}