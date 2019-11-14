import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ReferralRequestService {
  private baseUrl;
    private referralResponseMockUrl = 'assets/mock-data/client/referral/referral-response.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getServiceCodes(): Observable<any> {
    return this.http.get(this.baseUrl + 'qualifiercode?qualifierCode=-1');
  }
  getStates(): Observable<any> {
    return this.http.get(this.baseUrl + 'valueset/getstates');
  }

  search_word(term) {
    return this.http.get(this.baseUrl + 'code/findicd?keyword=' + term);
  }
  submitReferralInquiry(refferalRequestObject: any): Observable<any> {
    return this.http.post(this.baseUrl + 'editransaction/referralrequestforreview', refferalRequestObject);
  }
    getReferralDetailsData(): Observable<any> {
        return this.http.get(this.referralResponseMockUrl);
    }

  getCountryList(): Observable<any> {
    return this.http.get(this.baseUrl + 'country');
  }

  getStateByCountry(id): Observable<any> {
    return this.http.get(this.baseUrl + 'country/' + id + '/getstates');
  }

  getServicingProviders(payerID, recentProvider, requestObj): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerID + '/providerperson/find?recentprovider=' + recentProvider, requestObj);
  }

}
