import { Injectable } from '@angular/core';

export type HttpParams = { [key: string]: string | number };

@Injectable({
  providedIn: 'root'
})
export class NgxFetchApiService {

  baseUrl: string = '';

  constructor() { }

  setBaseUrl(baseUrl: string) {
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    this.baseUrl = baseUrl;
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

  request<T>(
    method: string,
    path: string,
    params?: HttpParams,
    data?: object,
  ): Promise<T> {
    const options = { method };
    if (data) {
      options['body'] = JSON.stringify(data);
    }

    return fetch(this.getUrl(path, params), options).then(response => {
      const contentType = response.headers.get('Content-Type');
      const isJson = contentType === 'application/json';

      if (response.status >= 200 && response.status < 300) {
        return isJson ? response.json() : null;
      } else {
        if (isJson) {
          return response.json().then(errors => {
            throw errors;
          });
        } else {
          throw response;
        }
      }
    });
  }

  get<T>(path: string, params?: HttpParams): Promise<T> {
    return this.request<T>('GET', path, params);
  }

  post<T>(path: string, data: any, params?: HttpParams): Promise<T> {
    return this.request<T>('POST', path, params, data);
  }

  put<T>(path: string, data: any, params?: HttpParams): Promise<T> {
    return this.request<T>('PUT', path, params, data);
  }

  delete(path: string, params?: HttpParams): Promise<void> {
    return this.request<void>('DELETE', path, params);
  }
}
