import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './../../config/config.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Injectable()
export class AddEditGroupService {
  private baseUrl;




  private getGroupByIdMockUrl = 'assets/mock-data/admin/group-management/groupById.json';
  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getStates(): Observable<any> {
    return this.http.get(this.baseUrl + 'valueset/getstates');
  }

  getRegions(): Observable<any> {
    return this.http.get(this.baseUrl + 'region');
  }
  getPermissions(regionIds): Observable<any> {

    return this.http.post(this.baseUrl + 'permission/gettxforregion', regionIds);
  }
  createGroup(groupObject): Observable<any> {
    return this.http.post(this.baseUrl + 'providergroup', groupObject);
  }

  updateGroup(groupObject): Observable<any> {
    return this.http.put(this.baseUrl + 'providergroup/' + groupObject.providerGroupId, groupObject);

  }
  getGroupById(id): Observable<any> {
    return this.http.get(this.baseUrl + '/providergroup/' + id);
  }

}
