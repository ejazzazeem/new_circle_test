import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserSessionService {
  private baseUrl;
  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getUserSessionInfo(): Observable<any> {
    return this.http.get(this.baseUrl + 'user/current');
  }
  getUserByUserId(userId): Observable<any> {
    return this.http.get(this.baseUrl + 'user/' + userId);
  }

  logout(): Observable<any> {
    return this.http.get(this.baseUrl + 'user/logout');
  }
}
