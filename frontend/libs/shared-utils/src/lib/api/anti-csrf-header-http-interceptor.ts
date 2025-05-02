import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { API_SERVER_VAR } from './api-client-consts';
import { Observable } from 'rxjs';

export function antiCsrfHeaderHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const headers = req.headers;

  if (req.url.startsWith(API_SERVER_VAR)) {
    req = req.clone({
      headers: headers.set('OpenWright-Csrf-Token', '1')
    });
  }

  return next(req);
}
