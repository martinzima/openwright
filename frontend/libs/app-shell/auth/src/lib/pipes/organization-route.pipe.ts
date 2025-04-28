import { inject, Pipe, PipeTransform } from '@angular/core';
import { UrlTree } from '@angular/router';
import { OrganizationRouter } from '../services/organization-router';
import { Organization } from '@openwright/web-api';
import { OrganizationContextService } from '../services/organization-context.service';

@Pipe({ name: 'organization' })
export class OrganizationRoutePipe implements PipeTransform {
  private readonly organizationRouter = inject(OrganizationRouter);
  private readonly organizationContextService = inject(OrganizationContextService);

  transform(value: string | UrlTree | unknown[],
            organization?: Organization): string | unknown[] | null | undefined {
    if (value === null) {
      return null;
    }

    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' || value instanceof UrlTree) {
      return this.organizationRouter.getGlobalUrl(value, organization?.urlSlug);
    }

    if (Array.isArray(value)) {
      return this.organizationRouter.getGlobalCommands(value, organization?.urlSlug);
    }

    throw new Error('Undefined input for OrganizationRoutePipe: ' + value);
  }
}
