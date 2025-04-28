import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { EnvironmentConfig } from '../config/environment-config';
import { API_SERVER_VAR } from './api-client-consts';
import { Observable } from 'rxjs';

export function apiUrlReplaceHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const headers = req.headers;

  if (req.url.startsWith(API_SERVER_VAR)) {
    req = req.clone({
      url: EnvironmentConfig.config.apiGatewayUrl + req.url.substr(API_SERVER_VAR.length, req.url.length - API_SERVER_VAR.length),
      headers
    });
  }

  return next(req);
}
