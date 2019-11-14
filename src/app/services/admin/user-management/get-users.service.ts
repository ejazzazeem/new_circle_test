import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import {HttpClient } from '@angular/common/http';
import { DataRequest } from '@models/index';

@Injectable()
export class GetUsersService {
    private baseUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    retrieveAllUsers(pageInfo: DataRequest): Observable<any> {
        return this.http.post(this.baseUrl + 'user/find', pageInfo);
}

    getUserByUserId(userId): Observable<any> {
        return this.http.get(this.baseUrl + 'user/' + userId);
    }
}
