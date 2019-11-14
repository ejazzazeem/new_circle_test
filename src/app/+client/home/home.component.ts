import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FooterService } from '@services/footer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  releaseNumber: any;
  constructor(private footerService: FooterService) {

  }

  ngOnInit() {
    this.releaseNumber = this.footerService.getVersion();
  }

}
