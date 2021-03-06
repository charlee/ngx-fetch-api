import { Component, OnInit } from '@angular/core';
import { NgxFetchApiService } from 'ngx-fetch-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'ngx-fetch-api-app';

  constructor(private fetchApi: NgxFetchApiService) {}

  ngOnInit() {
    this.fetchApi.configure({
      baseUrl: '/api',
      defaultHeaders: {
        'X-Test': 'test',
      },
      trailingSlash: 'always',
    });
    this.fetchApi.get('hello', { params: { t: 2, order: 'name' } });
    this.fetchApi.post('hello', { data: { t: 1 } }).then(ret => console.log(ret));
  }
}
