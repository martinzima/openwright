import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { MsAuthPlugin } from '@olify-monorepo/capacitor-plugins/msauth';
import { AuthApiService, AuthenticationMethod, Authenticator, AuthToken, deepEquals, EnvironmentConfig, GoogleAuthenticationData, Guid, isAuthTokenValid, LoginResult, MicrosoftAuthenticationData, PasswordAuthenticationData, PasswordLoginResultStatus, UserService } from '@olify-monorepo/shared';
import { MeApiService, User } from '@olify-monorepo/users-api';
import * as Sentry from '@sentry/angular-ivy';
import { firstValueFrom, forkJoin, from, Observable, of, timeout } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AUTH_CACHE_DATA_SCHEMA_VERSION } from '../model/auth-cache-data';
import { createMicrosoftLoginOptions } from '../utils/microsoft-auth-config';
import { AuthStorageService } from './auth-storage.service';
import { LOGIN_HANDLER_INJECTION_TOKEN } from './login-handler.service';

export class AuthState {
  isAuthenticating = false;
  isLoggingOut = false;
  authToken: AuthToken | null = null;
  user: User | null = null;
}

export class LoginError extends Error {
  constructor(public readonly loginResult: LoginResult) {
    super();
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticator = inject(Authenticator);
  private readonly authStorageService = inject(AuthStorageService);
  private readonly authApiService = inject(AuthApiService);
  private readonly meApiService = inject(MeApiService);
  private readonly userService = inject(UserService);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly loginHandlerService = inject(LOGIN_HANDLER_INJECTION_TOKEN);

  private readonly state = signal<AuthState>(new AuthState());

  readonly isAuthenticating = computed(() => this.state().isAuthenticating);
  readonly isAuthenticated = computed(() => !!this.state().authToken);
  readonly isAuthenticated$ = toObservable(this.isAuthenticated);
  readonly isExpired = () => this.isAuthenticated()
    && !isAuthTokenValid(this.state().authToken); // can't be computed because depends on current time
  readonly user = computed(() => this.state().user);
  readonly user$ = toObservable(this.user);
  readonly userId = computed(() => this.state().user?.id || null);
  readonly userId$ = toObservable(this.userId);
  readonly isLoggingOut = computed(() => this.state().isLoggingOut);

  constructor () {
    this.init();
  }

  async login(payload: { passwordAuthentication?: PasswordAuthenticationData,
    googleAuthentication?: GoogleAuthenticationData,
    microsoftAuthentication?: MicrosoftAuthenticationData }): Promise<LoginResult> {
    if (this.isAuthenticating()) {
      throw new Error('Already authenticating');
    }

    if (this.isAuthenticated()) {
      throw new Error('Already authenticated');
    }

    this.state.update(s => ({ ...s, isAuthenticating: true }));
    try {
      let authRequest: Observable<LoginResult>;
      let authenticationMethod: AuthenticationMethod;

      if (payload.passwordAuthentication) {
        authRequest = this.authApiService.logIn(payload.passwordAuthentication);
        authenticationMethod = AuthenticationMethod.Password;
      } else if (payload.googleAuthentication) {
        authRequest = this.authApiService.logInWithGoogle(payload.googleAuthentication);
        authenticationMethod = AuthenticationMethod.Google;
      } else if (payload.microsoftAuthentication) {
        authRequest = this.authApiService.logInWithMicrosoft(payload.microsoftAuthentication);
        authenticationMethod = AuthenticationMethod.Microsoft;
      } else {
        throw new Error('Invalid authentication method');
      }

      const loginResult = await firstValueFrom(authRequest);

      // normally, this would trigger HttpErrorResponse exception below, but to be sure:
      if (loginResult.status !== PasswordLoginResultStatus.Success) {
        throw new LoginError(loginResult);
      }

      let expirationDate = null;

      if (loginResult.expiresIn) {
        expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + loginResult.expiresIn);
      }

      const authToken: AuthToken = {
        accessToken: Guid.newGuid(),
        refreshToken: loginResult.hasRefreshToken ? Guid.newGuid() : null,
        tokenType: 'Bearer',
        expirationTimestamp: expirationDate?.getTime() ?? null,
        authenticationMethod
      };
      this.authenticator.authToken = authToken;

      const user = await firstValueFrom(this.meApiService.getMe());
      if (!user) {
        throw new Error('Null user returned from API');
      }

      this.writeAuthState({ token: authToken, user });

      return loginResult;
    } catch (error) {
      let thrown = error;
      if (error instanceof HttpErrorResponse) {
        const loginResult = error.error as LoginResult;
        if (Object.keys(PasswordLoginResultStatus).includes(loginResult?.status)) {
          thrown = new LoginError(error.error);
        }
      }

      await firstValueFrom(this.universalSocialLogout());

      this.writeAuthState({
        token: null,
        user: null
      });

      throw thrown;
    } finally {
      this.state.update(s => ({ ...s, isAuthenticating: false }));
    }
  }

  async logout() {
    if (!this.isLoggingOut()) {
      this.state.update(s => ({ ...s, isLoggingOut: true }));
    }

    await this.loginHandlerService.navigateToLogout();
  }

  async logoutCallback() {
    if (!this.isLoggingOut()) {
      throw new Error('Not logging out currently');
    }

    try {
      await firstValueFrom(forkJoin([
        this.authApiService.logOut().pipe(catchError(error => of(error))),
        this.universalSocialLogout()
      ]));

      this.writeAuthState({ token: null, user: null });
    } finally {
      this.state.update(s => ({ ...s, isLoggingOut: false }));
    }
  }

  async refreshAuthToken(): Promise<void> {
    await this.doWithRefreshLock(async () => await this.doRefreshAuthToken());
  }

  private readFromStorage() {
    const cache = this.authStorageService.readAuthCache();

    const user = cache?.user ?? null;
    const token = cache?.token ?? null;
    const userChanged = !deepEquals(user, this.state().user);
    const tokenChanged = !deepEquals(token, this.state().authToken);

    if (userChanged || tokenChanged) {
      this.state.update(s => ({
        ...s,
        authToken: tokenChanged ? token : s.authToken,
        user: userChanged ? user : s.user
      }));

      if (tokenChanged) {
        this.authenticator.authToken = token;
      }

      if (userChanged) {
        this.userService.currentUser = user;
      }
    }
  }

  private writeAuthState({ token, user }: { token?: AuthToken | null, user?: User | null }) {
    this.state.update(s => {
      const newToken = token === undefined ? s.authToken : token;
      const newUser = newToken ? (user === undefined ? s.user : user) : null
      return {
        ...s,
        authToken: newToken,
        user: newUser,
      };
    });

    this.authenticator.authToken = this.state().authToken;
    this.userService.currentUser = this.state().user;

    this.authStorageService.writeAuthCache(this.state().authToken
      ? {
        token: this.state().authToken!,
        user: this.state().user!,
        schemaVersion: AUTH_CACHE_DATA_SCHEMA_VERSION
      }
      : null);
  }

  private async doRefreshAuthToken(): Promise<void> {
    if (this.isLoggingOut()) {
      throw new Error('Logging out, cannot refresh auth token');
    }

    try {
      this.readFromStorage();
      if (!this.state().authToken) {
        throw new Error('No auth token to refresh');
      }

      if (isAuthTokenValid(this.state().authToken)) {
        return;
      }

      this.state.update(s => ({ ...s, isAuthenticating: true }));

      let authRequest: Observable<LoginResult>;

      if (this.state().authToken.refreshToken) {
        authRequest = this.authApiService.refreshToken();
      } else if ([AuthenticationMethod.Microsoft]
        .includes(this.state().authToken.authenticationMethod)) {
        // Google Sign-In does not support refresh with client-only flows, so we are generating refresh token
        // in AuthService like with regular password authentication
        if (this.state().authToken.authenticationMethod === AuthenticationMethod.Microsoft) {
          const options = createMicrosoftLoginOptions();
          const msAuthResult = await MsAuthPlugin.refreshToken(options);

          authRequest = this.authApiService.logInWithMicrosoft({
            accessToken: msAuthResult.accessToken,
            idToken: msAuthResult.idToken,
            tenantId: msAuthResult.tenantId
          });
        } else {
          throw new Error('Unknown authentication method');
        }
      } else {
        throw new Error('Auth token has no refresh methods')
      }

      const loginResult = await firstValueFrom(authRequest
        .pipe(timeout(15000)));
      if (loginResult.status !== PasswordLoginResultStatus.Success) {
        throw new LoginError(loginResult);
      }

      let expirationDate = null;

      if (loginResult.expiresIn) {
        expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + loginResult.expiresIn);
      }

      const authToken: AuthToken = {
        accessToken: Guid.newGuid(),
        refreshToken: loginResult.hasRefreshToken ? Guid.newGuid() : null,
        tokenType: 'Bearer',
        expirationTimestamp: expirationDate?.getTime() ?? null,
        authenticationMethod: this.state().authToken.authenticationMethod
      };

      this.writeAuthState({ token: authToken });
    } catch (error) {
      // TODO handle network errors of Google & MS auth token refresh?
      const isNetworkError = (error instanceof HttpErrorResponse
        && (error.status === 0 || error.status === 504));

      if (!isNetworkError) {
        await firstValueFrom(this.universalSocialLogout());

        this.writeAuthState({
          token: null,
          user: null
        });
      }

      throw error;
    } finally {
      this.state.update(s => ({ ...s, isAuthenticating: false }));
    }
  }

  private async doWithRefreshLock(work: () => Promise<void>): Promise<void> {
    let tokenRefreshUnlock: () => void = null;
    let promiseGranted: () => void = null;
    const lockGrantedPromise = new Promise<void>((resolve, reject) => promiseGranted = resolve);

    try {
      try {
        if (navigator.locks) {
          const abortCtrl = new AbortController();
          const abortTimer = setTimeout(() => {
            Sentry.captureMessage('Aborting auth token refresh lock request due to timeout');
            if (!tokenRefreshUnlock) {
              abortCtrl.abort();
            }
            promiseGranted();
          }, 16000);

          navigator.locks.request('olify-try-refresh-auth-token',
            { signal: abortCtrl.signal },
            (lock) => new Promise<void>((resolve, reject) => {
              clearTimeout(abortTimer);
              tokenRefreshUnlock = resolve;
              promiseGranted();
            })).catch(err => {
            clearTimeout(abortTimer);
            if (err.name !== 'AbortError') {
              console.error('Error acquiring auth token refresh lock', err);
              Sentry.captureException(err);
            }
            promiseGranted();
          });
        } else {
          promiseGranted();
        }
      } catch (error) { // lock-related error
        console.error('Error acquiring auth token refresh lock', error);
        Sentry.captureException(error);
      }

      await lockGrantedPromise;

      await work();
    } finally {
      if (tokenRefreshUnlock) {
        tokenRefreshUnlock();
      }
    }
  }

  private universalSocialLogout() {
    const promises: Promise<void>[]= [];
    if (Capacitor.getPlatform() === 'web') {
      promises.push(this.socialAuthService.signOut(false));
    } else {
      promises.push(GoogleAuth.signOut());
    }

    promises.push(MsAuthPlugin.logout({
      clientId: EnvironmentConfig.config.microsoftLoginClientId,
      keyHash: EnvironmentConfig.config.microsoftLoginAndroidSignatureHash
    }));

    return forkJoin(promises.map(promise =>
      from(promise).pipe(catchError(err => of(err)))))
      .pipe(map(() => {}));
  }

  private async init() {
    this.readFromStorage();

    this.authStorageService.cacheChanged$.subscribe(() =>
      this.readFromStorage());

    if (this.isExpired()) {
      try {
        await this.refreshAuthToken();
      } catch (error) {
        // ignore
      }
    }
  }
}