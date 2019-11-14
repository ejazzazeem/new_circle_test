import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConfigService} from '../config/config.service';


@Injectable()
export class BatchHandlerService {
  private baseUrl;

  private batchListMockUrl = 'assets/mock-data/client/batch/batch-list-response.json';

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  retrieveBatchList(userGroup: string, batchId: string): Observable<any> {
    return this.http.get(this.baseUrl + 'editransaction/batch?' + batchId + '=&usergroup=' + userGroup);
  }

  retrieveBatchListMockData(): Observable<any> {
    return this.http.get(this.batchListMockUrl);
  }

  getBatchByBatchId(batchId: string, groupId: string, fileType: string): Observable<any> {
    if (fileType === 'response') {
      return this.http.get(this.baseUrl + 'editransaction/batch/' + batchId + '?usergroup=' + groupId, {responseType: 'text'});
    } else {
      return this.http.get(this.baseUrl + 'editransaction/batch/' + batchId + '/batchrequest?usergroup=' +
          groupId, {responseType: 'text'});
    }
  }

  deleteBatchByBatchId(batchId: string, groupId: string): Observable<any> {
    return this.http.delete(this.baseUrl + 'editransaction/batch/' + batchId + '?usergroup=' + groupId);
  }

  submitBatchFile(formData, isIE): Observable<any> {
    if (!isIE) {
      const headers = new HttpHeaders({
        'Content-Type': 'multipart/form-data'
      });
      return this.http.post(this.baseUrl + 'editransaction/batch', formData , {headers : headers});
    } else {
      return this.http.post(this.baseUrl + 'editransaction/batch', formData);
    }

  }

}
