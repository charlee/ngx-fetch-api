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
    this.fetchApi.get('/api/hello/', { t: 2 });
  }
}
