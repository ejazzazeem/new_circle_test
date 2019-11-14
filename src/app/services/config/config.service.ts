import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { ApiConfiguration } from '@models/index';

@Injectable()
export class ConfigService {
  private config: ApiConfiguration;
  constructor(private http: Http) { }

  load(url: string) {
    return new Promise((resolve) => {
      const configSubscription = this.http.get(url).map(res => res.json())
        .subscribe( config => {
          this.config = config;
          resolve();

          configSubscription.unsubscribe();
        });
    });
  }

  getConfiguration(): ApiConfiguration {
    return this.config;
  }
}
