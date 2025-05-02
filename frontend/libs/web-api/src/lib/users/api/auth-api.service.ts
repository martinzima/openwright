import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiClientService } from "@openwright/shared-utils";

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiClient = inject(ApiClientService);

  logout(): Observable<void> {
    return this.apiClient.post('auth/logout');
  }
}
