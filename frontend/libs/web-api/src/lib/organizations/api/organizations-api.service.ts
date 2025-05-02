import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiClientService } from "@openwright/shared-utils";
import { CreateOrganizationPayload } from "../model/payloads/create-organization-payload";

@Injectable({ providedIn: 'root' })
export class OrganizationsApiService {
  private readonly apiClient = inject(ApiClientService);

  createOrganization(payload: CreateOrganizationPayload): Observable<void> {
    return this.apiClient.post('organizations', payload);
  }

  checkIsOrganizationUrlSlugAvailable(urlSlug: string): Observable<boolean> {
    return this.apiClient.get<{ available: boolean }>(`organizations/url-slugs/${urlSlug}`)
      .pipe(map(response => response.available));
  }
}