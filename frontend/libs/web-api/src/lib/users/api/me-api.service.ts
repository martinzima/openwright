import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Me } from "../model/me";
import { ApiClientService } from "@openwright/shared-utils";
import { CreateMyUserPayload } from "../model/payloads/create-my-user-payload";

@Injectable({ providedIn: 'root' })
export class MeApiService {
  private readonly apiClient = inject(ApiClientService);

  getMe(): Observable<Me | null> {
    return this.apiClient.get<Me>('me');
  }

  createMyUser(payload: CreateMyUserPayload): Observable<void> {
    return this.apiClient.post('me/user', payload);
  }
}
