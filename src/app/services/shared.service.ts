import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/forkJoin';

@Injectable()
export class SharedService {
    private baseUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    // Get AAA Rejection Display Messages for Reason Code and Followup Code
    getAAARejectionDisplayMessage(reasonCode, followupCode): Observable<any> {
        // Fork Join used to Combine Observables in parallel
        // Link: http://blog.danieleghidoli.it/2016/10/22/http-rxjs-observables-angular/
        return Observable.forkJoin([
            this.http.get(this.baseUrl + 'rejectreasoncode?rejectReasonCode=' + reasonCode),
            this.http.get(this.baseUrl + 'followupcode?followupCode=' + followupCode)
        ]);
    }

    // Get payer list for a specific transaction through permission Id (transaction id)
    getUserPayers(permissionId, userRole): Observable<any> {
        // If user is provider then add 'byuserregions', if user type is something else add 'bypayertransaction'
        return this.http.get(this.baseUrl + 'payer/' +
            (userRole === 'PRACTICE_OFFICE_USER' ? 'byuserregions/' : 'bypayertransaction/') + permissionId);
    }

    // Get the permission settings for a specific permission of a specific payer.
    getPermissionSetting(payerId, permissionId): Observable<any> {
        return this.http.get(this.baseUrl + 'payer/' + payerId + '/transaction/' + permissionId);
    }

    getRequestingProviders(payerID, recentProvider, groupRequest): Observable<any> {
        return this.http.post(this.baseUrl + 'payer/' + payerID + '/getproviders?recentprovider=' + recentProvider, groupRequest);
    }
}
