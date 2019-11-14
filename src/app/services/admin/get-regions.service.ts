import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GetRegionsService {
    private baseUrl;

    constructor(private http: HttpClient,
                private configService: ConfigService) {
        this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
    }

    getAllRegions(): Observable<any> {
        return this.http.get(this.baseUrl + 'region');
    }
}
