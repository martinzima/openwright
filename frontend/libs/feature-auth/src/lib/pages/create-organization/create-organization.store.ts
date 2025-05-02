import { computed, inject, Injectable, signal } from '@angular/core';
import { OrganizationsApiService } from '@openwright/web-api';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@openwright/app-shell-auth';
import { generateUuidV4 } from '@openwright/shared-utils';

export interface CreateOrganizationModel {
  name: string;
  urlSlug: string;
}

export interface CreateOrganizationState {
  isSubmitting: boolean;
  error: unknown | null;
}

@Injectable()
export class CreateOrganizationStore {
  private readonly organizationsApiService = inject(OrganizationsApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly state = signal<CreateOrganizationState>({
    isSubmitting: false,
    error: null,
  });

  readonly isSubmitting = computed(() => this.state().isSubmitting);
  readonly error = computed(() => this.state().error);

  async submit(model: CreateOrganizationModel): Promise<void> {
    if (this.state().isSubmitting) {
      return;
    }
    this.state.set({ isSubmitting: true, error: null });

    try {
      await lastValueFrom(this.organizationsApiService.createOrganization({
        ...model,
        id: generateUuidV4()
      }));
      await this.authService.refreshMe();

      this.state.set({ isSubmitting: false, error: null });
      this.router.navigate(['/', model.urlSlug, 'dashboard']);
    } catch (error: unknown) {
      this.state.set({ isSubmitting: false, error });
    }
  }
}