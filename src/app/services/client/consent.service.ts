import { Injectable } from '@angular/core';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConsentRequest } from '@models/index';

@Injectable()
export class ConsentService {

    private baseUrl;

    constructor(private http: HttpClient,
            // private sanitizer: DomSanitizer,
            private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    getConsent(consentRequest: ConsentRequest): Observable<any> {
        return this.http.post(this.baseUrl + 'consent/query', consentRequest);
    }

    getConsentFormUrl(data: ConsentRequest): string {
        let queryParams = '';
        if (data) {
            if (data.firstName) {
                queryParams += 'firstname=' + data.firstName + '&';
            }
            if (data.lastName) {
                queryParams += 'lastname=' + data.lastName + '&';
            }
            if (data.gender) {
                queryParams += 'gender=' + data.gender + '&';
            }
            if (data.dateOfBirth) {
                queryParams += 'dateofbirth=' + data.dateOfBirth;
            }
        }
        return encodeURI(this.baseUrl + 'consent/form?' + queryParams);
    }

}
