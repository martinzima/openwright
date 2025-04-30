import { inject, Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { MeApiService } from '@openwright/web-api';
import { CreateMyUserPayload } from '@openwright/web-api';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

interface SubmissionState {
  loading: boolean;
  error: string | null;
}

@Injectable()
export class CreateOrganizationStore {
  private readonly meApiService = inject(MeApiService);
  private readonly router = inject(Router);

  private readonly state = signal<SubmissionState>({
    loading: false,
    error: null,
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  async submit(payload: CreateMyUserPayload): Promise<void> {
    if (this.state().loading) {
      return;
    }
    this.state.set({ loading: true, error: null });

    try {
      await lastValueFrom(this.meApiService.createMyUser(payload));
      this.state.set({ loading: false, error: null });
      this.router.navigate(['/create-organization']);
    } catch (err: any) {
      this.state.set({ loading: false, error: err.message ?? 'Failed to create account.' });
    }
  }
}