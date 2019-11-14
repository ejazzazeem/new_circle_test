import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';

@Injectable()
export class FooterService {
  private releaseNumber;
  constructor(private configService: ConfigService) {
    this.releaseNumber = this.configService.getConfiguration().releaseNumber;
  }

  getVersion() {
    return this.releaseNumber;
  }

}
