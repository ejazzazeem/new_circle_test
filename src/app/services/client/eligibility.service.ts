import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EligibilityService {
  private baseUrl;
  //   private eligibilityResponseMockUrl = 'assets/mock-data/client/eligibility/updated-xslt-response.json';
  //  private eligibilityResponseMockUrl = 'assets/mock-data/client/eligibility/eligibility-response-clair-north.json';
  // private eligibilityResponseMockUrl = 'assets/mock-data/client/eligibility/eligibility-response-declan-left.json';
  private eligibilityResponseMockUrl = 'assets/mock-data/client/eligibility/eligibility-response.json';

  // private eligibilityResponseMultiMockUrl = 'assets/mock-data/client/eligibility/eligibility-multiple-response.json';
  //   private eligibilityResponseMockUrl = 'assets/mock-data/client/eligibility/eligibility-single-response-dependent.json';
  // private eligibilityResponseMultiMockUrl = 'assets/mock-data/client/eligibility/eligbility_AAA_Response.json';
   private eligibilityResponseMultiMockUrl = 'assets/mock-data/client/eligbility_Response_Plan_AA_Error.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getRequestingProvidersAllPayers(permissionId, recentProvider, groupRequest): Observable<any> {
    return this.http.post(this.baseUrl +
        'payer/getallpayersproviderperson/' + permissionId + '?recentProvider=' + recentProvider, groupRequest);
  }

  getServiceCodes(): Observable<any> {
    return this.http.get(this.baseUrl + 'systemtypecode?systemTypeCode=-1');
  }

  getMedicaidPayerName(): Observable<any> {
    return this.http.get(this.baseUrl + 'emednypayername');
  }

  submitEligibilityInquiry(eligibilityData): Observable<any> {
    return this.http.post(this.baseUrl + 'editransaction/inquiryeligibilitybenefit', eligibilityData);
  }

  // Eligibility Inquiry Form Services Ends

  // Fetch Data for a Single Eligibility Response Detail Page
  getEligibilityDetailsData(): Observable<any> {
    return this.http.get(this.eligibilityResponseMockUrl);
  }

  // Fetch Data for Multiple Eligibility Response Page
  getEligibilityMultipleResponseData(): Observable<any> {
    return this.http.get(this.eligibilityResponseMultiMockUrl);
  }
}
