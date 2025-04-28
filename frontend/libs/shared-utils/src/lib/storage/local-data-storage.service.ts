import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LocalDataStorageService {
  private _onstorage$ = new Subject<StorageEvent>();

  constructor() {
    window.addEventListener('storage', this.storageListener);
  }

  get onstorage$(): Observable<StorageEvent> {
    return this._onstorage$;
  }

  getItem(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  removeItem(key: string) {
    window.localStorage.removeItem(key);
  }

  setItem(key: string, data: string) {
    window.localStorage.setItem(key, data);
  }


  getObject<T>(key: string): T | null {
    const json = this.getItem(key);
    if (json) {
      try {
        const asObject = JSON.parse(json);
        return asObject;
      }
      catch (e) {
        //
      }
    }

    return null;
  }

  setObject<T>(key: string, data: T) {
    const json = JSON.stringify(data);
    this.setItem(key, json);
  }

  private storageListener = (event: StorageEvent) => {
    this._onstorage$.next(event);
  }
}