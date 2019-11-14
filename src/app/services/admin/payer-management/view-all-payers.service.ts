import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../config/config.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ViewAllPayersService {

  private baseUrl;
  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;

  }

  getAllPayers(payload): Observable<any> {
    return  this.http.post(this.baseUrl + 'payer/find', payload);
  }

  deletePayer(payerId): Observable<any> {
    return  this.http.delete(this.baseUrl + 'payer/' + payerId);
  }

}
