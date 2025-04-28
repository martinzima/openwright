import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthCacheData } from '../model/auth-cache-data';
import { LocalDataStorageService } from '@openwright/shared-utils';

export const AUTH_CACHE_DATA_SCHEMA_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class AuthCacheService {
  private readonly AUTH_CACHE_STORAGE_KEY = '__openwright_auth_cache';

  private _authCache: AuthCacheData | null = null;
  private _cacheChanged$ = new Subject<AuthCacheData | null>();

  constructor(private localDataStorageService: LocalDataStorageService) {
    this.localDataStorageService.onstorage$
    .subscribe(_event => {
      if (_event.key == this.AUTH_CACHE_STORAGE_KEY) {
        this._cacheChanged$.next(this.readAuthCache());
      }
    });
  }

  get cacheChanged$(): Observable<AuthCacheData | null> {
    return this._cacheChanged$;
  }

  readAuthCache(): AuthCacheData | null {
    const authCacheJson = this.localDataStorageService.getItem(this.AUTH_CACHE_STORAGE_KEY);
    let authCache = authCacheJson ? JSON.parse(authCacheJson) as AuthCacheData : null;
    if (authCache) {
      if (!authCache.me) {
        //Sentry.captureMessage('Error reading auth cache: null user', 'error');
        authCache = null;
      } else if (authCache?.schemaVersion !== AUTH_CACHE_DATA_SCHEMA_VERSION) {
        authCache = null;
      }
    }

    this._authCache = authCache;
    return this._authCache;
  }

  writeAuthCache(value: AuthCacheData | null) {
    this._authCache = value;
    this.localDataStorageService.setItem(this.AUTH_CACHE_STORAGE_KEY, JSON.stringify(value));
  }
}
