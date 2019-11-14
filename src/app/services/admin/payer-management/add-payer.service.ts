import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { AuthenticationType, TransportType } from '@models/index';

@Injectable()
export class AddPayerService {

  private baseUrl;
  private payerTransportMockUrl = 'assets/mock-data/admin/payer-management/transportType.json';
  private authenticationListMockUrl = 'assets/mock-data/admin/payer-management/authenticationType.json';

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getPayerTransportList(): Observable<TransportType> {
    return this.http.get(this.payerTransportMockUrl);
  }

  getAuthenticationList(): Observable<AuthenticationType> {
    return this.http.get(this.authenticationListMockUrl);
  }

  getPayerRegionList(): Observable<any> {
    return this.http.get(this.baseUrl + 'region');
  }

  addPayer(payerPayLoad: any): Observable<any> {
    return this.http.post(this.baseUrl + 'payer', payerPayLoad);
  }

  updatePayer(payerPayLoad: any, payerId: any): Observable<any> {
    return this.http.put(this.baseUrl + 'payer/' + payerId, payerPayLoad);
  }

  getPayerDetail(payerId: any): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/' + payerId);
  }
  checkPayerUniqueness(payerName: string): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/uniquepayername?payername=' + payerName);
  }
}
