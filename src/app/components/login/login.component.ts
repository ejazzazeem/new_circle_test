import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
    AlertService,
    AuthenticationService,
    ConfigService,
    CurrentUserService,
    LoaderService
} from '@services/index';
import { TestCredentials } from '@models/index';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {

    model: any = {};
    returnUrl: string;
    testAuth: boolean;
    currentUser: string;
    currentToken: string;
    private unSubscribe = new Subject();

    constructor(private route: ActivatedRoute,
                private router: Router,
                private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private configService: ConfigService,
                private currentUserService: CurrentUserService,
                private loaderService: LoaderService) {
    }

    ngOnInit() {
        // Clear Alert if redirected from interceptor level on error i.e. session timeout
        // Implemented because ambiguous error messages from components display on this page if not removed
        this.alertService.setNext();

        // reset login status
         this.currentUser = localStorage.getItem('currentUser');
         this.currentToken = localStorage.getItem('token');

         if (this.currentUser !== null || this.currentToken !== null) {
              this.authenticationService.logout();
         }
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        this.testAuth = this.configService.getConfiguration().testAuth;
        this.loaderService.display(false);
    }

    login() {
        this.loaderService.display(true);
        this.authenticationService.ensureLogOut();

        const userCredentials: TestCredentials = {
            username: this.model.userName,
        };

        this.authenticationService.testLogin(userCredentials.username)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
               if (data === undefined) {
                   this.currentUserService.getCurrentUser().then(currentUser => {
                       this.router.navigate(['']);
                   }).catch(error => {
                       this.loaderService.display(false);
                       console.error('Error getting current user during login: ' + error);
                   });
               } else {
                   this.alertService.error(data);
                   this.loaderService.display(false);
               }

            },
            error => {
                this.loaderService.display(false);
                this.alertService.error('User does not exist, kindly contact Admin');
            }
        );
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}
