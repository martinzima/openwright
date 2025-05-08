import { inject, Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { MeApiService } from '@openwright/web-api';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@openwright/app-shell-auth';

export interface CreateAccountModel {
  email: string;
  firstName: string;
  lastName: string;
}

export interface CreateAccountState {
  isSubmitting: boolean;
  error: unknown | null;
  model: CreateAccountModel;
}

@Injectable()
export class CreateAccountStore {
  private readonly meApiService = inject(MeApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly state = signal<CreateAccountState>({
    isSubmitting: false,
    error: null,
    model: {
      email: '',
      firstName: '',
      lastName: ''
    }
  });

  readonly isSubmitting = computed(() => this.state().isSubmitting);
  readonly error = computed(() => this.state().error);
  readonly model = computed(() => this.state().model);

  updateModel(model: Partial<CreateAccountModel>): void {
    this.state.update(prev => ({ ...prev, model: { ...prev.model, ...model } }));
  }

  async submit(): Promise<void> {
    if (this.state().isSubmitting) {
      return;
    }
    this.state.update(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      await lastValueFrom(this.meApiService.createMyUser({
        ...this.model(),
      }));
      await this.authService.refreshMe();

      this.state.update(prev => ({ ...prev, isSubmitting: false, error: null }));
      this.router.navigate(['/create-organization']);
    } catch (error: unknown) {
      this.state.update(prev => ({ ...prev, isSubmitting: false, error }));
    }
  }
}