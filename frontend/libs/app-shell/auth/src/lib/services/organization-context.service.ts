import { Injectable, signal } from "@angular/core";
import { Organization } from "@openwright/web-api";

@Injectable({ providedIn: 'root' })
export class OrganizationContextService {
  private readonly _organization = signal<Organization | null>(null);

  readonly organization = this._organization.asReadonly();

  setOrganization(organization: Organization | null) {
    this._organization.set(organization);
  }
}