import { computed, Injectable } from "@angular/core";
import { inject } from "@angular/core";
import { signal } from "@angular/core";
import { AUTH_CACHE_DATA_SCHEMA_VERSION, AuthCacheService } from "./auth-cache.service";
import { Me, MeApiService } from "@openwright/web-api";
import { firstValueFrom } from "rxjs";
import { deepEquals } from "@openwright/shared-utils";
import { HttpErrorResponse } from "@angular/common/http";

export class AuthState {
  isLoading = true;
  me: Me | null = null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authCacheService = inject(AuthCacheService);
  private readonly meApiService = inject(MeApiService);

  private readonly state = signal<AuthState>(new AuthState());

  readonly isLoading = computed(() => this.state().isLoading);
  readonly isAuthenticated = computed(() => !!this.state().me);
  readonly me = computed(() => this.state().me);
  readonly roleGrants = computed(() => this.state().me?.roleGrants);
  readonly user = computed(() => this.state().me?.user);

  constructor () {
    this.init();
  }

  private readFromStorage() {
    const cache = this.authCacheService.readAuthCache();

    const me = cache?.me ?? null;
    const meChanged = !deepEquals(me, this.state().me);

    if (meChanged) {
      this.state.update(s => ({
        ...s,
        me: meChanged ? me : s.me
      }));
    }
  }

  private writeAuthState(me: Me | null) {
    this.state.update(s => {
      return {
        ...s,
        me
      };
    });

    this.authCacheService.writeAuthCache(me
      ? {
        me,
        schemaVersion: AUTH_CACHE_DATA_SCHEMA_VERSION
      }
      : null);
  }

  private async init() {
    try {
      this.readFromStorage();

      this.authCacheService.cacheChanged$.subscribe(() =>
        this.readFromStorage());

      if (this.state().me) {
        this.refreshMe();
      } else {
        await this.refreshMe();
      }
    } finally {
      this.state.update(s => ({
        ...s,
        isLoading: false
      }));
    }
  }

  private async refreshMe() {
    try {
      const newMe = await firstValueFrom(this.meApiService.getMe());
      this.writeAuthState(newMe);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        this.writeAuthState(null);
      } else {
        throw error;
      }
    }
  }
}