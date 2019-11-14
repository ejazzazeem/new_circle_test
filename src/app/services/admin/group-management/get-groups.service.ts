import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {HttpClient} from '@angular/common/http';
import { DataRequest } from '@models/index';

@Injectable()
export class GetGroupsService {
    private baseUrl;
    private getGroupUserMockUrl = 'assets/mock-data/admin/group-management/group-users.json';
    private getGroupProvidersMockUrl = 'assets/mock-data/admin/group-management/group-providers.json';

    constructor(private http: HttpClient, private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }




    getGroupByGroupId(selectedGroupId): Observable<any> {


        return this.http.get(this.baseUrl + 'providergroup/' + selectedGroupId);
    }

    getGroupAndAuthorizedContactByGroupId(selectedGroupId): Observable<any> {


        return this.http.get(this.baseUrl + 'group/' + selectedGroupId);
    }

    getGroupUsers(groupId, pageInfo: DataRequest): Observable<any> {
        return this.http.post(this.baseUrl + 'group/' + groupId + '/user', pageInfo);
    }

    getGroupProviders(groupId, groupRequest): Observable<any> {
        return this.http.post(this.baseUrl + 'group/' + groupId + '/taxid/getall', groupRequest);
    }

    getTaxIDDetails(taxId, request): Observable<any> {
        return this.http.post(this.baseUrl + 'group/taxid/' + taxId + '/getproviderpersons', request);
    }



    associateTaxId(groupId, taxId): Observable<any> {
        return this.http.post(this.baseUrl + 'group/' + groupId + '/taxid' , {taxId : taxId});

    }
    removeAssociatedTaxId(groupId, taxId): Observable<any> {
        return this.http.delete(this.baseUrl + 'group/' + groupId + '/taxid/' + taxId  );
    }
}
