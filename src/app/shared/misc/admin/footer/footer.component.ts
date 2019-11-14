import { Component, OnInit } from '@angular/core';
import {ConfigService, FooterService} from '@services/index';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  releaseNumber: any;

  constructor(private footerService: FooterService) {}

  ngOnInit() {
    this.releaseNumber = this.footerService.getVersion();
  }

  validateHeight() {
    const el = document.getElementsByClassName('left-sidenav-container')[0];
    const height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    const elH = el.clientHeight + 50;
    return height > elH;
  }

}
