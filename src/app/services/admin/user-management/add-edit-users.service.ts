import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AddEditUserService {
    private baseUrl;
    private permissionUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl + 'user';
        this.permissionUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    addUser(userData): Observable<any> {
        return this.http.post(this.baseUrl, userData);
    }

    editUser(userData): Observable<any> {
        return this.http.put(this.baseUrl + '/' + userData.userId, userData);
    }

    validateLoginId(loginId): Observable<any> {
        return this.http.get(this.baseUrl + '/uniqueloginid?loginid=' + loginId);
    }

    getPermissionByRole(role): Observable<any> {
        return this.http.get(this.permissionUrl + '/permission/getbyrole?role=' + role);
    }
}
