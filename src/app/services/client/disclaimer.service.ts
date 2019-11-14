import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DisclaimerService {
    private baseUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    getDisclaimerText(): Observable<any> {
      return this.http.get(this.baseUrl + 'disclaimer');
    }
}
