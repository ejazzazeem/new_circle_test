import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ReferralAuthService {
  private baseUrl;

  private referralAuthResponseMultiMockUrl = 'assets/mock-data/client/referral-auth/referral-auth-multiple-response.json';
  private referralAuthResponseMultiMockUrl1 = 'assets/mock-data/client/referral-auth/278-215-1.json';
  private referralAuthResponseMultiMockUrl2 = 'assets/mock-data/client/referral-auth/278-215-2.json';
  private referralAuthResponseMultiMockUrl3 = 'assets/mock-data/client/referral-auth/278-215-3.json';
  private referralAuthResponseMultiMockUrl4 = 'assets/mock-data/client/referral-auth/278-215-4.json';
  private referralAuthResponseMultiMockUrl5 = 'assets/mock-data/client/referral-auth/278-215-5.json';
  private referralAuthResponseMultiMockUrl6 = 'assets/mock-data/client/referral-auth/278-215-6.json';
  private referralAuthResponseMultiMockUrl7 = 'assets/mock-data/client/referral-auth/multiHealthNo-deidentified-278_217.json';
  private referralAuthResponseMultiMockUrl8 = 'assets/mock-data/client/referral-auth/HealthNo-deidentified-278_217.json';
  private referralResponseMockUrl = 'assets/mock-data/client/referral-auth/referral-auth-single-response.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  // Fetch Data for Multiple Referral Auth Response Page
  getReferralAuthMultipleResponseData(): Observable<any> {
     return this.http.get(this.referralAuthResponseMultiMockUrl);
    // return this.http.get(this.referralAuthResponseMultiMockUrl1);
    // return this.http.get(this.referralAuthResponseMultiMockUrl2);
    // return this.http.get(this.referralAuthResponseMultiMockUrl3);
    // return this.http.get(this.referralAuthResponseMultiMockUrl4);
    // return this.http.get(this.referralAuthResponseMultiMockUrl5);
    // return this.http.get(this.referralAuthResponseMultiMockUrl6);
   // return this.http.get(this.referralAuthResponseMultiMockUrl7);
    // return this.http.get(this.referralAuthResponseMultiMockUrl8);
  }

  // Fetch Data for a Single Referral Auth Response Detail Page
  getReferralAuthDetailsData(): Observable<any> {
    return this.http.get(this.referralResponseMockUrl);
  }

  submitReferralAuthInquiry(referralAuthRequestObject: any): Observable<any> {
    return this.http.post(this.baseUrl + 'editransaction/inquiryreferralauth', referralAuthRequestObject);
  }
}
