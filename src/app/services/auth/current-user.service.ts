import { Injectable } from '@angular/core';
import { CurrentUser } from '@models/index';
import { UserSessionService } from './user-session.service';

/**
 * @author Corrina Burnley
 */
@Injectable()
export class CurrentUserService {

    private currentUser: CurrentUser;

    constructor(private userSessionService: UserSessionService) { }

    getCurrentUser(): Promise<CurrentUser> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                resolve(this.currentUser);
                return;
            }

            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                this.currentUser = JSON.parse(currentUser);
                resolve(this.currentUser);
                return;
            }

            const userSessionInfoSubscription = this.userSessionService.getUserSessionInfo().subscribe(
                data => {
                    if (data) {
                        this.populateCurrentUser(data);
                        localStorage.setItem('currentUser', JSON.stringify(data));
                        resolve(data);
                        userSessionInfoSubscription.unsubscribe();
                    } else {
                        // No current user
                        resolve(null);
                    }
                },
                error => {
                    console.error('Unable to retrieve current user.');
                    reject(error);
                }
            );
        });
    }

    populateCurrentUser(user): CurrentUser {
        this.currentUser = user;
        // In API, enum value is inside another role object
        this.currentUser.role = user.role.role;
        if (this.currentUser.role === 'LEVEL_2_ADMINISTRATOR' || this.currentUser.role === 'LEVEL_1_ADMINISTRATOR' ) {
            this.currentUser.isHealtheNetAdmin = true;
        } else if (this.currentUser.role === 'PRACTICE_OFFICE_USER') {
            this.currentUser.isProviderOfficeUser = true;
        } else if (this.currentUser.role === 'PAYER_USER') {
            this.currentUser.isPayerUser = true;
        }
        return this.currentUser;
    }

    clearCurrentUser() {
        this.currentUser = null;
    }

}
