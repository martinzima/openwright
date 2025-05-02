import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { API_SERVER_VAR } from "./api-client-consts";
import { EnvironmentConfig } from "../config/environment-config";
import { HttpResponse, HttpEvent } from "@angular/common/http";

export enum HttpRequestMethod {
  Delete = 'DELETE', Get = 'GET', Head = 'HEAD', Options = 'OPTIONS', Patch = 'PATCH', Post = 'POST', Put = 'PUT'
}

export interface HttpClientOptions {
  requiresAuth?: boolean;
  tenantId?: string;
  headers?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly httpClient = inject(HttpClient);

  getFullUrl(path: string) {
    return EnvironmentConfig.config.apiGatewayUrl + '/' + path;
  }

  getUrl(path: string) {
    return API_SERVER_VAR + '/' + path;
  }

  sendRequest<T>(path: string, method: HttpRequestMethod, options?: HttpClientOptions): Observable<HttpResponse<T>> {
    const url = this.getUrl(path);

    return this.httpClient.request<T>(method, url, {
      headers: this.addHeaders({}, options),
      observe: 'response',
      responseType: 'json'
    });
  }

  sendJson<T, TPayload>(path: string, method: HttpRequestMethod, body?: TPayload, options?: HttpClientOptions): Observable<HttpResponse<T>> {
    const url = this.getUrl(path);

    return this.httpClient.request<T>(method, url, {
      body,
      headers: this.addHeaders({
        'Content-Type': 'application/json'
      }, options),
      observe: 'response',
      responseType: 'json'
    });
  }

  requestBlob(path: string, method: HttpRequestMethod, options?: HttpClientOptions): Observable<HttpEvent<Blob>> {
    const url = this.getUrl(path);

    return this.httpClient.request(method, url, {
      headers: this.addHeaders({}, options),
      observe: 'events',
      responseType: 'blob',
      reportProgress: true
    });
  }

  get<T extends void>(url: string): Observable<void>;
  get<T extends object>(url: string): Observable<T>;

  get<T>(url: string): Observable<T | null> {
    return this.sendRequest<T>(url, HttpRequestMethod.Get)
      .pipe(map(response => response.body));
  }

  post<T extends void, TPayload>(url: string, body?: TPayload): Observable<void>;
  post<T extends object, TPayload>(url: string, body?: TPayload): Observable<T>;

  post<T, TPayload>(url: string, body?: TPayload): Observable<T | null> {
    return this.sendJson<T, TPayload>(url, HttpRequestMethod.Post, body)
      .pipe(map(response => response.body));
  }

  private addHeaders(headers: Record<string, string>, options?: HttpClientOptions): Record<string, string> {
    headers['Accept'] = 'application/json';

    if (options?.requiresAuth !== false) {
      headers['Authorization'] = 'Bearer'; // this enables the use of auth interceptor
    }

    if (options?.headers) {
      for (const key of Object.keys(options.headers)) {
        headers[key] = options.headers[key];
      }
    }

    return headers;
  }
}
