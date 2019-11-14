import {UserDataTableModel} from '@models/user.model';

export const userInfo: UserDataTableModel[] = [
    { userID: '5cd9d7e5-edca-4e1d-b959-899c78aa8022', firstName: 'USER1', lastName: 'lnUSER1', userGroups: ['GRP4'], userPayers: [] },
    { userID: 'f6c16011-debe-4b48-bab8-397135ace56a', firstName: 'USER2', lastName: 'lnUSER2', userGroups: ['GRP4'], userPayers: [] },
    { userID: '429294d1-1620-4602-9219-e7305a00c458', firstName: 'USER3', lastName: 'lnUSER3', userGroups: [], userPayers: [] },
    { userID: '345d462f-9eda-4f92-bca4-7a9f254575ff', firstName: 'USER4', lastName: 'lnUSER4', userGroups: [], userPayers: ['GRP2'] },
    { userID: 'b34fd452-8a4a-434a-8b7e-7cbefda75568', firstName: 'USER5', lastName: 'lnUSER5', userGroups: [] , userPayers: ['GRP2'] },
    { userID: 'e9a258ce-5fe7-4293-b7f4-3d2e437eb1a8', firstName: 'USER6', lastName: 'lnUSER6', userGroups: [], userPayers: [] },
    { userID: '099f807c-ae8f-4216-9771-1e7f728e5bec', firstName: 'USER7', lastName: 'lnUSER7', userGroups: [] , userPayers: [] },
    { userID: '39b21cd0-ec8c-441b-937a-496b657e68f1', firstName: 'USER8', lastName: 'lnUSER8', userGroups: [], userPayers: [] },
    { userID: '31ad2b4f-4c39-44ef-8377-264706350d34', firstName: 'USER9', lastName: 'lnUSER9', userGroups: [] , userPayers: [] },
    { userID: '35d58a8d-0cf5-4d0b-9c60-84f833999931', firstName: 'USER10', lastName: 'lnUSER10', userGroups: [] , userPayers: [] }
 ];

// Mock Data - User Group
export const userGroups = [
    { id: 1, value: 'gOne', viewValue: 'Group One', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 2, value: 'gTwo', viewValue: 'Group Two', checked: false,
        regions:  [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 3, value: 'gThree', viewValue: 'Group Three', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 4, value: 'gFour', viewValue: 'Group Four', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 5, value: 'gFive', viewValue: 'Group Five', checked: false,
        regions: [
            {id: 1, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]}
        ]
    },
    { id: 6, value: 'gSix', viewValue: 'Group Six', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 7, value: 'gSeven', viewValue: 'Group Seven', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 8, value: 'gEight', viewValue: 'Group Eight', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                    {id: 4, value: 'referral-request', viewValue: 'Referral Request', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    }
];

// Mock Data - User Payers
export const userPayers = [
    {id: 1, value: 'pOne', viewValue: 'Payer One', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 2, value: 'pTwo', viewValue: 'Payer Two', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 3, value: 'pThree', viewValue: 'Payer Three', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 4, value: 'pFour', viewValue: 'Payer Four', checked: false,
        permissions: [
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 5, value: 'pFive', viewValue: 'Payer Five', checked: false,
        permissions: [
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: false},
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: false}
        ]},
    {id: 6, value: 'pSix', viewValue: 'Payer Six', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 7, value: 'pSeven', viewValue: 'Payer Seven', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 8, value: 'pEight', viewValue: 'Payer Eight', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]}
];

// Mock Data - User Groups
export const userGroups1 = [
    { id: 1, value: 'gOne', viewValue: 'Group One', checked: true,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: true,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 2, value: 'gTwo', viewValue: 'Group Two', checked: false,
        regions:  [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 3, value: 'gThree', viewValue: 'Group Three', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 4, value: 'gFour', viewValue: 'Group Four', checked: true,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 5, value: 'gFive', viewValue: 'Group Five', checked: true,
        regions: [
            {id: 1, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]}
        ]
    },
    { id: 6, value: 'gSix', viewValue: 'Group Six', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 7, value: 'gSeven', viewValue: 'Group Seven', checked: true,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 8, value: 'gEight', viewValue: 'Group Eight', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                    {id: 4, value: 'referral-request', viewValue: 'Referral Request', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    }
];

// Mock Data - User Payers
export const userPayers1 = [
    {id: 1, value: 'pOne', viewValue: 'Payer One', checked: true,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: true},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: true},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: false}
        ]},
    {id: 2, value: 'pTwo', viewValue: 'Payer Two', checked: true,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 3, value: 'pThree', viewValue: 'Payer Three', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 4, value: 'pFour', viewValue: 'Payer Four', checked: true,
        permissions: [
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 5, value: 'pFive', viewValue: 'Payer Five', checked: false,
        permissions: [
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: false},
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: false}
        ]},
    {id: 6, value: 'pSix', viewValue: 'Payer Six', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 7, value: 'pSeven', viewValue: 'Payer Seven', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: true},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]},
    {id: 8, value: 'pEight', viewValue: 'Payer Eight', checked: false,
        permissions: [
            {id: 1, value: 'eligibility-inquiry-admin', viewValue: 'Eligibility Inquiry Admin', checked: false},
            {id: 2, value: 'provider-inquiry-admin', viewValue: 'Provider Inquiry Admin', checked: false},
            {id: 3, value: 'referral-request-admin', viewValue: 'Referral Request Admin', checked: false},
            {id: 4, value: 'auth-inquiry-admin', viewValue: 'Referral / Auth Inquiry Admin', checked: true}
        ]}
];

// Mock Data - User Groups
export const userGroups3 = [
    { id: 1, value: 'gOne', viewValue: 'Group One', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 2, value: 'gTwo', viewValue: 'Group Two', checked: true,
        regions:  [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 3, value: 'gThree', viewValue: 'Group Three', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 4, value: 'gFour', viewValue: 'Group Four', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 5, value: 'gFive', viewValue: 'Group Five', checked: true,
        regions: [
            {id: 1, value: 'rTwo', viewValue: 'Region Two', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 3, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 4, value: 'rFive', viewValue: 'Region Five', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]}
        ]
    },
    { id: 6, value: 'gSix', viewValue: 'Group Six', checked: true,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: true,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: true,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 7, value: 'gSeven', viewValue: 'Group Seven', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    },
    { id: 8, value: 'gEight', viewValue: 'Group Eight', checked: false,
        regions: [
            {id: 1, value: 'rOne', viewValue: 'Region One', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                    {id: 4, value: 'referral-request', viewValue: 'Referral Request', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 2, value: 'rTwo', viewValue: 'Region Two', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 3, value: 'rThree', viewValue: 'Region Three', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 3, value: 'provider-inquiry', viewValue: 'Provider Inquiry', checked: false},
                ]},
            {id: 4, value: 'rFour', viewValue: 'Region Four', checked: false,
                permissions: [
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]},
            {id: 5, value: 'rFive', viewValue: 'Region Five', checked: false,
                permissions: [
                    {id: 1, value: 'eligibility-inquiry', viewValue: 'Eligibility Inquiry', checked: true},
                    {id: 2, value: 'claim-status', viewValue: 'Claims Status Inquiry', checked: false},
                    {id: 5, value: 'auth-inquiry', viewValue: 'Referral / Auth Inquiry', checked: true},
                    {id: 6, value: 'consent-inquiry', viewValue: 'Consent Inquiry', checked: true},
                    {id: 7, value: 'consent-update', viewValue: 'Consent Update', checked: false}
                ]}
        ]
    }
];

// Mock Data - User Single User Info
export const userReadData: any = [
    {
        userInfo: [{
            userID: '10245',
            firstName: 'John',
            lastName: 'Doe',
            dob: '2013-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2012-01-01'
    }, {
        userInfo: [{
            userID: '10265',
            firstName: '',
            lastName: '',
            dob: '',
            pinCode: '',
            email: '',
            externalId: '',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'net-exchange', viewValue: 'NetExchange Account'}
        }],
        userGroups: [],
        userPayers: userPayers1,
        lastEdited: '2000-11-11'
    }, {
        userInfo: [{
            userID: '10255',
            firstName: 'John',
            lastName: 'Doe',
            dob: '2013-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups3,
        userPayers: [],
        lastEdited: '1992-01-01'
    }, {
        userInfo: [{
            userID: '24245',
            firstName: 'Mike',
            lastName: 'Doe',
            dob: '2013-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups3,
        userPayers: [],
        lastEdited: '2003-01-01'
    }, {
        userInfo: [{
            userID: '10244',
            firstName: 'Barney',
            lastName: 'Doe',
            dob: '2013-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups3,
        userPayers: [],
        lastEdited: '2013-02-15'
    }, {
        userInfo: [{
            userID: '10000',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'admin', viewValue: 'HEALTHeNET Admin'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '1993-07-20'
    }, {
        userInfo: [{
            userID: '10205',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups3,
        userPayers: [],
        lastEdited: '2013-01-01'
    }, {
        userInfo: [{
            userID: '10243',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups3,
        userPayers: [],
        lastEdited: '2013-01-01'
    }, {
        userInfo: [{
            userID: '10284',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2013-01-01'
    }, {
        userInfo: [{
            userID: '11245',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2013-01-01'
    }, {
        userInfo: [{
            userID: '12123',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2013-01-01'
    }, {
        userInfo: [{
            userID: '12345',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '1992-01-01'
    }, {
        userInfo: [{
            userID: '14245',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2010-11-01'
    }, {
        userInfo: [{
            userID: '24674',
            firstName: 'John',
            lastName: 'Doe',
            dob: '1992-01-01',
            pinCode: '7340',
            email: 'johnDoe@gmail.com',
            externalId: '000014556781575',
            loginId: 'John1',
            password: 'john1234',
            selectedUserType: {value: 'provider', viewValue: 'Provider Office User'}
        }],
        userGroups: userGroups1,
        userPayers: [],
        lastEdited: '2002-03-05'
    }
];
