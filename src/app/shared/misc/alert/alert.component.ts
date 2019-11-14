import {Component, OnDestroy, OnInit} from '@angular/core';


import { AlertService } from '@services/index';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {

  message: any;
  private unSubscribe = new Subject();

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertService.getMessage()
        .takeUntil(this.unSubscribe).subscribe(message => { this.message = message; });
  }

  closeAlert() {
    this.message = null;
  }

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
