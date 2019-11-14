import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, CurrentUserService } from '../../../../services/index';

@Component({
    selector: 'app-side-menu-admin',
    templateUrl: './side-menu-admin.component.html',
    styleUrls: ['./side-menu-admin.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SideMenuAdminComponent implements OnInit {
    model: any = { };
    menuItems = ['active', '', '', '', '', ''];
    isRefreshed = false;
    loginId: string;
    hasPayerAccess = false;
    hasProviderGroupAccess = false;

    constructor(private router: Router,
                private currentUserService: CurrentUserService,
                private authenticationService: AuthenticationService) {

        // To Reload current route
        this.router.routeReuseStrategy.shouldReuseRoute = function() {
            return false;
        };
    }

    ngOnInit() {
        this.currentUserService.getCurrentUser().then(currentUser => {
            if (currentUser) {
                this.loginId = currentUser.loginId;
                if (currentUser.isPayerUser || currentUser.role === 'LEVEL_2_ADMINISTRATOR') {
                    this.hasPayerAccess = true;
                }
                if (currentUser.isProviderOfficeUser || currentUser.isHealtheNetAdmin) {
                    this.hasProviderGroupAccess = true;
                }
            } else {
                this.loginId = 'User Name';
            }

            if (localStorage.getItem('menuState') === null || localStorage.getItem('menuState') === undefined ) {
                this.model = {
                    smallView: null,
                    largeView: null,
                    noClass: true
                };
            } else {
                this.model = JSON.parse(localStorage.getItem('menuState'));
                this.isRefreshed = true;
            }

            const activeRoute = this.router.url;
            if (activeRoute.indexOf('user') !== -1) {
                this.setMenuItems(0);
            } else if (activeRoute.indexOf('group') !== -1) {
                this.setMenuItems(1);
            } else if (activeRoute.indexOf('payer') !== -1) {
                this.setMenuItems(2);
            } else if (activeRoute.indexOf('reporting') !== -1) {
                this.setMenuItems(3);
            } else if (activeRoute.indexOf('batch') !== -1) {
                this.setMenuItems(4);
            }
        }).catch(error => {
            console.error('Error getting current user while initializing side menu: ' + error);
        });
    }

    toggleMenu() {
        if (this.model.noClass === true) {
            this.model.smallView = true;
            this.model.noClass = null;
        } else if (this.model.smallView === true) {
            this.model.largeView = true;
            this.model.smallView = false;
        } else {
            this.model.largeView = false;
            this.model.smallView = true;
        }
        this.isRefreshed = false;
        localStorage.setItem('menuState', JSON.stringify( this.model));
    }

    /**
     * @ngdoc method
     * @name navigateToRoute
     * @methodOf healtheNet.ui.service: SideMenuAdminComponent
     * @param viewScreen
     * @paramType string
     * @description
     * navigate to the desired route, if User is already on the route then refresh the page if same tab is clicked from
     * side bar.
     */
    navigateToRoute(viewScreen) {
        const activeRoute = this.router.url;
        // remove tableFilter Options from local storage. The view of management page
        // will populate it again with default values
        localStorage.removeItem('tableFilters');
        localStorage.removeItem('reportDetail');
        if (activeRoute.indexOf(viewScreen) !== -1) {
            // To Reload current route
            this.router.navigated = false;
        }
        if (viewScreen !== 'reporting/reports') {
            localStorage.removeItem('MyReport');
            localStorage.removeItem('currentReport');
            localStorage.removeItem('reportDetail');
            localStorage.removeItem('currentTab');
        }
        (viewScreen === 'reporting/reports' || viewScreen === 'batch-handler/batch') ?
            this.router.navigate([viewScreen]) : this.router.navigate(['/admin/' + viewScreen]);
    }

    setMenuItems(index) {
        for (let i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i] = (i === index) ? 'active' : '';
        }
    }

    logout() {
        this.authenticationService.logout();
    }
}
