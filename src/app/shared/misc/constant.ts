// All Constants

// User Roles Constants
export const USER_ROLES = {
    PRACTICE_ROLE: 'Practice Office User',
    PAYER_ROLE: 'Payer User',
    ADMIN1_ROLE: 'LEVEL_1_ADMINISTRATOR',
    ADMIN2_ROLE: 'LEVEL_2_ADMINISTRATOR',
    NETEXCHANGEROLE: 'NetExchange Account'
};
// Cookie Expiry Date
export const COOKIE_EXPIRY  = '2020-01-01';

export const currencyType = 'USD';
export const currencySymbol = 'symbol';
export const currencyDisplayOption = '1.2-2';


// Zip Code Masking - Start -----------------------------------------

// 9 characters masking
export const ZIP_MASK_9_CHAR = [/[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/,
    /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, '-', /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/];

// 6 characters masking
export const ZIP_MASK_6_CHAR = [/[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, ' ', /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/];

// 5 characters masking
export const ZIP_MASK_5_CHAR = [/[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/];

// Zip Code Masking - End -----------------------------------------

// Phone Mask
export const PHONE_MASK = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

export const inquiryTypes = [
    {id: '2', description: 'Billed Amount'},
    {id: '3', description: 'Change Units'},
    {id: '4', description: 'Date of Service'},
    {id: '5', description: 'Diagnosis Code Change'},
    {id: '6', description: 'Place of Service'},
    {id: '7', description: 'Procedure Code'},
    {id: '8', description: 'Provider Identifier'},
    {id: '9', description: 'SHD - Definite Dupe'},
    {id: '10', description: 'System Updates'},
    {id: '11', description: 'Valid Online Relationship'},
    {id: '12', description: 'Withdraw Payment'},
    {id: '18', description: 'Other Party Liability (OPL)'},
    {id: '19', description: 'Adjustment'},
    {id: '20', description: 'HEDIS or Quality'},
    {id: '21', description: 'Risk Revenue'},
    {id: '22', description: 'Special Investigations Unit'}
];

// User Roles Constants
export const BATCH_STATUS = {
    NEW: 'New',
    PENDING: 'Pending',
    RUNNING: 'Running',
    ASSEMBLED: 'Assembled',
    FAILED: 'Failed',
    MARKED_FOR_DELETION: 'Marked For Deletion'
};
