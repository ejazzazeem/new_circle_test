import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class DisclaimerGuard implements CanActivate {

    constructor(private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const disclaimerDisplayed = localStorage.getItem('displayDisclaimer');
        if (disclaimerDisplayed && disclaimerDisplayed === 'true') {
            this.router.navigate(['client/disclaimer']);
            // localStorage.setItem('displayDisclaimer', 'true');
            return false;
        }
        return true;
    }
}
