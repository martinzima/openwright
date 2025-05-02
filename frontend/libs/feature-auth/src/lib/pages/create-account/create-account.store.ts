import { inject, Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { MeApiService } from '@openwright/web-api';
import { CreateMyUserPayload } from '@openwright/web-api';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@openwright/app-shell-auth';

interface CreateAccountState {
  isSubmitting: boolean;
  error: unknown | null;
}

@Injectable()
export class CreateAccountStore {
  private readonly meApiService = inject(MeApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly state = signal<CreateAccountState>({
    isSubmitting: false,
    error: null,
  });

  readonly isSubmitting = computed(() => this.state().isSubmitting);
  readonly error = computed(() => this.state().error);

  async submit(payload: CreateMyUserPayload): Promise<void> {
    if (this.state().isSubmitting) {
      return;
    }
    this.state.set({ isSubmitting: true, error: null });

    try {
      await lastValueFrom(this.meApiService.createMyUser(payload));
      this.state.set({ isSubmitting: false, error: null });
      this.authService.refreshMe();

      this.router.navigate(['/create-organization']);
    } catch (error: unknown) {
      this.state.set({ isSubmitting: false, error });
    }
  }
}