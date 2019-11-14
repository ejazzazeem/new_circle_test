import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import {Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ConfigService } from './config/config.service';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class SetHeaderInterceptorService implements HttpInterceptor {
    testAuth: boolean;
    ssoAuthUrl: string;
    downUrl: string;

    constructor(private router: Router,
                public dialog: MatDialog,
                private configService: ConfigService,
                private cookieService: CookieService ) {
        this.testAuth = this.configService.getConfiguration().testAuth;
        this.ssoAuthUrl = this.configService.getConfiguration().ssoAuthUrl;
        this.downUrl = this.configService.getConfiguration().downUrl;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem('token');
        request = request.clone({
            withCredentials: true,
            setHeaders: {
                Authorization: 'Bearer ' + token,
                'cache-control': 'no-cache',
                'pragma' : 'no-cache'
            }
        });

        return next.handle(request).pipe(
            tap(
                // Succeeds when there is a response; ignore other events
                event => {
                    // You can Log success response here....
                },

                // Operation failed; error is an HttpErrorResponse
                error => {
                    console.log(error);
                    // Navigate to Login Page if Response is 401 i.e. User is Unauthenticated or Session Expired
                    if (error.status === 401) {
                        this.dialog.closeAll();
                        // Close any dialogs if open
                        localStorage.clear();
                        this.cookieService.remove('SESSION_KEY');
                        if (this.testAuth) {
                            this.router.navigate(['/login']);
                        } else {
                            window.location.href = this.ssoAuthUrl;
                        }
                    }
                    if (error.status === 0) {
                        if (this.testAuth) {
                            this.router.navigate(['/login']);
                        } else {
                        window.location.href = this.downUrl;
                        }
                    }
                },
            )
        );
    }
}
