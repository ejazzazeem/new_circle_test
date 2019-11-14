import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../config/config.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class GroupListService {
  private baseUrl;

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getAllGroups(requestPayload): Observable<any> {
    return this.http.post(this.baseUrl + 'providergroup/find', requestPayload);
  }

  getGroups(): Observable<any> {
    return this.http.get(this.baseUrl + 'providergroup/find?groupname=' + '-1');
  }

  getGroupsByName(keyword): Observable<any> {
    return this.http.get(this.baseUrl + 'providergroup/find?groupname=' + keyword);
  }
}
