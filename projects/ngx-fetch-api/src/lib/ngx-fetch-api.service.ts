import { Injectable } from '@angular/core';
import * as Cookies from 'js-cookie';

export type HttpParams = { [key: string]: string | number };

export type HttpHeaders = { [key: string]: string };

export type HttpMethods = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions<T extends object> {
  params?: HttpParams;
  headers?: HttpHeaders;
  data?: object;
}

export interface NgxFetchApiConfig {
  /**
   * Base URL of the API service. All the relative paths used in `get`, `post`, ...
   * will be prefixed with `baseUrl`.
   */
  baseUrl: string;

  /**
   * Default HTTP headers that are injected to all requests.
   */
  defaultHeaders: HttpHeaders;

  /**
   * Cookie name from which CSRF token will be retrieved.
   */
  csrfCookieName: string;

  /**
   * CSRF header name.
   */
  csrfHeaderName: string;
}

@Injectable({
  providedIn: 'root',
})
export class NgxFetchApiService implements NgxFetchApiConfig {
  baseUrl: string = '';
  defaultHeaders: HttpHeaders = {};
  csrfCookieName: string = 'csrftoken';
  csrfHeaderName: string = 'X-CSRFToken';

  constructor() {}

  configigure(config: NgxFetchApiConfig) {
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

  request<T extends object>(
    method: HttpMethods,
    path: string,
    options?: RequestOptions<T>,
  ): Promise<T> {
    const fetchOptions = { method };
    const headers = this.getHeaders(options.headers || {});
    if (options.data) {
      fetchOptions['body'] = JSON.stringify(options.data);
      headers['Content-Type'] = 'application/json';
    }

    fetchOptions['headers'] = headers;

    return fetch(this.getUrl(path, options.params), fetchOptions).then(response => {
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

  get<T extends object>(path: string, params?: HttpParams): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  post<T extends object>(path: string, data: T, params?: HttpParams): Promise<T> {
    return this.request<T>('POST', path, { params, data });
  }

  put<T extends object>(path: string, data: Partial<T>, params?: HttpParams): Promise<T> {
    return this.request<T>('PUT', path, { params, data });
  }

  patch<T extends object>(
    path: string,
    data: Partial<T>,
    params?: HttpParams,
  ): Promise<T> {
    return this.request<T>('PATCH', path, { params, data });
  }

  delete<T extends object>(path: string, params?: HttpParams): Promise<T> {
    return this.request<T>('DELETE', path, { params });
  }
}
