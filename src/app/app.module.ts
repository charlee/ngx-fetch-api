import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxFetchApiModule } from 'ngx-fetch-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFetchApiModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
