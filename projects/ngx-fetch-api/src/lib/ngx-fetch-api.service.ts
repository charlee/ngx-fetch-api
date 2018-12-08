import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';

export type HttpParams = { [key: string]: string | number };

export type HttpHeaders = { [key: string]: string };

export type HttpMethods = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  params?: HttpParams;
  headers?: HttpHeaders;
}

export interface RequestOptionsWithData<T extends object> extends RequestOptions {
  data?: T;
}

export interface NgxFetchApiConfig {
  /**
   * Base URL of the API service. All the relative paths used in `get`, `post`, ...
   * will be prefixed with `baseUrl`.
   */
  baseUrl?: string;

  /**
   * Default HTTP headers that are injected to all requests.
   */
  defaultHeaders?: HttpHeaders;

  /**
   * Cookie name from which CSRF token will be retrieved.
   */
  csrfCookieName?: string;

  /**
   * CSRF header name.
   */
  csrfHeaderName?: string;

  /**
   * Whether to add trailing slash to the end of url.
   */
  trailingSlash?: 'always' | 'none' | 'write_only';
}

@Injectable({
  providedIn: 'root',
})
export class NgxFetchApiService {
  private baseUrl: string = '';
  private defaultHeaders: HttpHeaders = {};
  private csrfCookieName: string = 'csrftoken';
  private csrfHeaderName: string = 'X-CSRFToken';
  private trailingSlash = 'write_only';

  constructor() {}

  configure(config: NgxFetchApiConfig) {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl.endsWith('/')
        ? config.baseUrl.slice(0, -1)
        : config.baseUrl;
    }

    if (config.defaultHeaders) {
      this.defaultHeaders = config.defaultHeaders;
    }

    if (config.csrfCookieName) {
      this.csrfCookieName = config.csrfCookieName;
    }

    if (config.csrfHeaderName) {
      this.csrfHeaderName = config.csrfHeaderName;
    }

    if (config.trailingSlash) {
      this.trailingSlash = config.trailingSlash;
    }
  }

  getHeaders(headers?: HttpHeaders): HttpHeaders {
    const newHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Inject csrftoken
    const csrftoken = Cookies.get(this.csrfCookieName);
    if (csrftoken) {
      newHeaders[this.csrfHeaderName] = csrftoken;
    }

    return newHeaders;
  }

  private getUrl(path: string, params?: HttpParams): string {
    let url = path.startsWith('/') ? path : `${this.baseUrl}/${path}`;

    if (params) {
      const pairs = [];
      for (const k in params) {
        const v = params[k];
        if (v !== null && typeof v !== 'undefined') {
          pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent('' + v));
        }
      }

      url = `${url}?${pairs.join('&')}`;
    }

    return url;
  }

  request<T extends object | void>(
    method: HttpMethods,
    path: string,
    options?: RequestOptionsWithData<Partial<T>> | RequestOptions,
  ): Promise<T> {
    const fetchOptions = { method };
    const headers = this.getHeaders(options.headers || {});
    if ((<RequestOptionsWithData<Partial<T>>>options).data) {
      fetchOptions['body'] = JSON.stringify(
        (<RequestOptionsWithData<Partial<T>>>options).data,
      );
      headers['Content-Type'] = 'application/json';
    }

    fetchOptions['headers'] = headers;

    if (!path.endsWith('/')) {
      const ts = this.trailingSlash;
      if (ts === 'always' || (ts === 'write_only' && method !== 'GET')) {
        path = path + '/';
      }
    }

    const url = this.getUrl(path, options.params);

    return fetch(url, fetchOptions).then(response => {
      const contentType = response.headers.get('Content-Type');
      const isJson = contentType === 'application/json';

      if (response.status >= 200 && response.status < 300) {
        return isJson ? response.json() : null;
      } else if (response.status === 400 && isJson) {
        response.json().then(json => {
          throw json;
        });
      } else {
        throw response;
      }
    });
  }

  get<T extends object>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  post<T extends object>(path: string, options?: RequestOptionsWithData<T>): Promise<T> {
    return this.request<T>('POST', path, options);
  }

  put<T extends object>(path: string, options?: RequestOptionsWithData<T>): Promise<T> {
    return this.request<T>('PUT', path, options);
  }

  patch<T extends object>(
    path: string,
    options?: RequestOptionsWithData<Partial<T>>,
  ): Promise<T> {
    return this.request<T>('PATCH', path, options);
  }

  delete(path: string, options?: RequestOptions): Promise<void> {
    return this.request<void>('DELETE', path, options);
  }
}
