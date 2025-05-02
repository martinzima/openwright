import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { OrganizationContextService } from './organization-context.service';
import { API_SERVER_VAR } from '@openwright/shared-utils';

export function organizationIdHeaderHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const headers = req.headers;
  const organizationContextService = inject(OrganizationContextService);

  if (req.url.startsWith(API_SERVER_VAR)) {
    req = req.clone({
      headers: headers.set('OpenWright-Organization-Id', organizationContextService.organization()?.id ?? '')
    });
  }

  return next(req);
}
