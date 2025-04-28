import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateAccountStore } from './create-account.store';
import { MessageModule } from 'primeng/message';
import { CreateMyUserPayload } from '@openwright/web-api';

@Component({
  selector: 'ow-create-account-page',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule
  ],
  providers: [CreateAccountStore],
})
export class CreateAccountPageComponent {
  readonly store = inject(CreateAccountStore);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value as CreateMyUserPayload;
    this.store.submit(payload);
  }
}