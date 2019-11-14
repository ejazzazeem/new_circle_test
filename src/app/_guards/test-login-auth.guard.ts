import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ConfigService } from '../services';

@Injectable()
export class TestLoginAuthGuard implements CanActivate {

    testAuth: boolean;

    constructor(private configService: ConfigService) {
        this.testAuth = this.configService.getConfiguration().testAuth;
    }

    canActivate() {
        return this.testAuth;
    }

}
