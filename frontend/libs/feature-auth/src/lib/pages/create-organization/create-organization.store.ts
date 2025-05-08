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
  model: CreateOrganizationModel;
}

@Injectable()
export class CreateOrganizationStore {
  private readonly organizationsApiService = inject(OrganizationsApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly state = signal<CreateOrganizationState>({
    isSubmitting: false,
    error: null,
    model: {
      name: '',
      urlSlug: ''
    }
  });

  readonly isSubmitting = computed(() => this.state().isSubmitting);
  readonly error = computed(() => this.state().error);
  readonly model = computed(() => this.state().model);

  updateModel(model: Partial<CreateOrganizationModel>): void {
    this.state.update(prev => ({ ...prev, model: { ...prev.model, ...model } }));
  }

  async submit(): Promise<void> {
    if (this.state().isSubmitting) {
      return;
    }
    this.state.update(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      await lastValueFrom(this.organizationsApiService.createOrganization({
        ...this.model(),
        id: generateUuidV4()
      }));
      await this.authService.refreshMe();

      this.state.update(prev => ({ ...prev, isSubmitting: false, error: null }));
      this.router.navigate(['/', this.model().urlSlug, 'dashboard']);
    } catch (error: unknown) {
      this.state.update(prev => ({ ...prev, isSubmitting: false, error }));
    }
  }
}