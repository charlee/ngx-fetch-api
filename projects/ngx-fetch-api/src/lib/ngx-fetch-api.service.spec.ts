import { TestBed } from '@angular/core/testing';

import { NgxFetchApiService } from './ngx-fetch-api.service';

describe('NgxFetchApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxFetchApiService = TestBed.get(NgxFetchApiService);
    expect(service).toBeTruthy();
  });
});
