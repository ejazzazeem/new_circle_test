import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../config/config.service';

@Injectable()
export class ClaimStatusService {
  private baseUrl;

  private claimStatusResponseMultiMockUrl = 'assets/mock-data/client/claim-status/claim-status-multiple-response.json';
  private claimResponseMockUrl = 'assets/mock-data/client/claim-status/claim-single-response.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  // Fetch Data for Multiple Claim Status Response Page
  getClaimMultipleResponseData(): Observable<any> {
    return this.http.get(this.claimStatusResponseMultiMockUrl);
  }

  // Fetch Data for a Single Claim Response Detail Page
  getClaimDetailsData(): Observable<any> {
    return this.http.get(this.claimResponseMockUrl);
  }
  submitClaimStatusInquiry(claimStatusRequestObject: any): Observable<any> {
    return this.http.post(this.baseUrl + 'editransaction/inquiryclaimstatus', claimStatusRequestObject);
  }
  search_word(term) {
    return this.http.get(this.baseUrl + 'code/findbilltype?keyword=' + term);
  }
}
