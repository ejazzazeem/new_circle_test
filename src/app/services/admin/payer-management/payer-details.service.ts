import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class PayerDetailsService {
  private baseUrl;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getPayerTransactions(payerId): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/' + payerId + '/transaction');
  }

  createCustomTransaction(payerId, data): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerId + '/transaction', data);
  }

  removeCustomTransaction(payerId, permissionId): Observable<any> {
    return this.http.delete(this.baseUrl + 'payer/' + payerId + '/transaction/' + permissionId);
  }
  updateTransaction( payerId, permissionId, permission): Observable<any> {
    return this.http.put(this.baseUrl + 'payer/' + payerId + '/transaction/' + permissionId, permission);
  }

  fetchXlsFile(payerId, transactionId): Observable<any> {
    return this.http.get(this.baseUrl + 'payer/' + payerId + '/transaction/' + transactionId + '/stylesheet');
  }

  getpayerProviders(payerId, groupRequest): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerId + '/providerperson', groupRequest);
  }

  updateNetworkPath(payerId, folderPath): Observable<any> {
    return this.http.put(this.baseUrl + 'payer/' + payerId + '/provideruploadpath', {'folderPath': folderPath} );
  }

  getServicingProviders(payerID, recentProvider, providerMode, requestObj): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerID + '/providerperson/find?recentprovider=' + recentProvider +
        '&providermode=' + providerMode, requestObj);
  }
  getRequestingProviders(payerID, recentProvider, requestObj): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/' + payerID + '/providerperson/find?recentprovider=' +
        recentProvider + '&requestingprovider=' + true, requestObj);
  }
  getRequestingProviderForAllPayers(permissionId, recentProvider, requestObj): Observable<any> {
    return this.http.post(this.baseUrl + 'payer/providerperson/' + permissionId + '?recentProvider=' + recentProvider, requestObj);
  }
}
