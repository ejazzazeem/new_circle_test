import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DeleteUserService {
    private baseUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    deleteUser(userId): Observable<any> {
        return this.http.delete(this.baseUrl + 'user/' + userId);
    }
}
