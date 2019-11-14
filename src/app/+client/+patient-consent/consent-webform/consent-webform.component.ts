import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ConsentService } from '../../../services/client/index';

@Component({
  selector: 'app-consent-webform',
  templateUrl: 'consent-webform.component.html',
  styleUrls: ['consent-webform.component.scss'],
})

export class ConsentWebformComponent implements OnInit {

  consentUrl: SafeResourceUrl;
  private unSubscribe = new Subject();

  constructor(private sanitizer: DomSanitizer,
          private consentService: ConsentService,
          private http: HttpClient) {
  }

  ngOnInit() {
      this.consentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.consentService.getConsentFormUrl(null));
  }

}
