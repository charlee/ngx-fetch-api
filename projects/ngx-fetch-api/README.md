# NgxFetchApiApp

A library for Angular 6+ using [JavaScript fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
to access RESTful API.

## Install

```
npm install --save ngx-fetch-api
```

## Configuration

Import `NgxFetchApiModule` module in your `app.module.ts`:

```
import { NgxFetchApiModule } from 'ngx-fetch-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFetchApiModule,          // Add this line
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

In your `app.component.ts` or any global components, inject `NgxFetchApiService` and run `configure`:

```
export class AppComponent implements OnInit {
    constructor(private api: NgxFetchApiService) {}

    ngOnInit() {
        this.api.configure({
            baseUrl: '/api',
            defaultHeaders: {
                'User-Agent': 'MyApp/1.0',
            },
            trailingSlash: 'always',
        });
    }
}
```

## Usage

Inject `NgxFetchApiService` and make HTTP calls:

```
export class MyComponent {
    constructor(private api: NgxFetchApiService) {}

    async fetchBookList() {
        // This will request '/api/books?order=name&page=1&limit=25'
        const books = await this.api.get('books', {
            params: { order: 'name', page: 1, limit: 25 }
        });

        // Promise style, create a book
        this.api.post('books', {
            data: { name: 'A Study in Scarlet' },
        }).then(book => console.log(book));
    }
}
```
