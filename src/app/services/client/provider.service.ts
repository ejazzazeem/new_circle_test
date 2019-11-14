import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProviderService {
  private baseUrl;
  // private providerInquiryResponseMultiMockUrl = 'assets/mock-data/client/provider/provider-inquiry-multi-response.json';
  // private providerResponseMockUrl = 'assets/mock-data/client/provider/provider-inquiry-details.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  // Provider Inquiry Form Services Starts
  getPayersByRegions(permissionId): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/byuserregions/' + permissionId);
  }
// todo - need to move them to common as it is shared accross pages
  getDirectPayers(permissionId): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/bypayertransaction/' + permissionId);
  }

  getRequestingProviders(payerID, recentProvider, groupRequest): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerID + '/getproviders?recentprovider=' + recentProvider, groupRequest);
  }

  // Provider Inquiry Status/summary
  submitProviderInquiryStatus(providerInquiryStatusObject: any): Observable<any> {
    return this.http.post(this.baseUrl + 'transaction/providerinquiry/getsummarylist', providerInquiryStatusObject);
  }

  // Provider Inquiry
  submitProviderInquiry(providerInquiryObject: any): Observable<any> {
    return this.http.post(this.baseUrl + 'transaction/providerinquiry', providerInquiryObject);
  }
    getProviderSummaryDetails(providerInquiryDetailsObject: any): Observable<any> {
        return this.http.post(this.baseUrl + 'transaction/providerinquiry/getdetail' , providerInquiryDetailsObject);
    }

  getPermissionSetting(payerId, permissionId): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/' + payerId + '/transaction/' + permissionId);
  }
  getUserByUserId(userId): Observable<any> {
    return this.http.get(this.baseUrl + 'user/' + userId);
  }
  getAttachment(payerData): Observable<any> {
    return this.http.post(this.baseUrl + 'transaction/providerinquiry/getattachment', payerData);
    // return this.http.get('assets/mock-data/client/provider/attachment.json');
  }

}
