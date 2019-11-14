import { Injectable } from '@angular/core';
import * as moment from 'moment';
import {isNullOrUndefined} from 'util';

@Injectable()
export class UtilsService {

  getClaimServiceDate(from: Date, to: Date): any {
    return (this.isValid(from) && this.isValid(to)) ?
      moment(from).format('YYYYMMDD') + '-' + moment(to).format('YYYYMMDD') : null;
  }
  getInquiryDateTo(to: Date): any {
    return this.isValid(to) ? moment(to).format('YYYY-MM-DD') : null;
  }

  getInquiryDateFrom(from: Date): any {
    return this.isValid(from) ? moment(from).format('YYYY-MM-DD') : null;
  }

  isValid(value: any): boolean {
    return !(isNullOrUndefined(value) || value === '');
  }

  formatDate(date: Date): any {
    return this.isValid(date) ? moment(date).format('YYYY-MM-DD') : null;
  }



  /**
   * @ngdoc utilService
   * @name setPermissionIdInLocalStorage
   * @methodOf healtheNet.ui.service: UtilsService
   * @param permissionName
   * @paramType string
   * @description
   * Get permission name as an argument and fetch it's permission Id from permission List
   * saved in the Local Storage
   */
  setPermissionIdInLocalStorage(permissionName: string): string {
    // Get list of permission from local storage to fetch it's permission Id
    const permissionList = JSON.parse(localStorage.getItem('permissionList'));
    if (permissionList && permissionList.length > 0) {
      let permissionId = '';

      // case handled for provider inquiry summary
      const tempPermissionName = permissionName === 'Provider Inquiry Summary' ? 'Provider Inquiry' : '';

      permissionList.forEach(permission => {
        if (permission.name === permissionName || tempPermissionName === permission.name) {
          if (!tempPermissionName) {
            // Store permission Id from local storage if permission is anything other than Provider Inquiry Summary
            permissionId = permission.permissionId;
            localStorage.setItem('permissionId', permission.permissionId);
          } else {
            // Store permission Id from local storage if permission is Provider Inquiry Summary
            permissionId = permission.permissionId + '_summary';
            localStorage.setItem('permissionId', permission.permissionId + '_summary');
          }

          if (permissionName !== 'Reporting') {
            localStorage.removeItem('reportDetail');
          }
        }
      });

      return permissionId;
    }

    return '';
  }

  /**
   * @ngdoc utilService
   * @name setTableFiltersInLocalStorage
   * @methodOf healtheNet.ui.service: UtilsService
   * @param viewType
   * @param filterOptions
   * @param viewScreen
   * @paramType string, string, object
   * @description
   * Get filter Options name as an argument and save filter in localStorage
   */
  setTableFiltersInLocalStorage(viewType: string, viewScreen: string, filterOptions: any): string {
    // Get filter options from local storage
    let tableFilters = JSON.parse(localStorage.getItem('tableFilters'));

    // Set the filters on first attempt after Login, if there are no filters set then set to default
    if (viewType === '' && !tableFilters) {
      tableFilters = this.setDefaultFilterOptions(viewScreen, filterOptions);
    }

    if (tableFilters) {
      if (Object.keys(tableFilters[viewScreen]).length !== 0) {
        switch (viewType) {
          case 'user':
            tableFilters.user.pageSize = filterOptions.pageSize;
            tableFilters.user.currentOffset = filterOptions.currentOffset;
            tableFilters.user.searchField = filterOptions.searchField;
            tableFilters.user.sortField.fieldName = filterOptions.sortField.fieldName;
            tableFilters.user.sortField.sortOrder = filterOptions.sortField.sortOrder;
            break;
          case 'group':
            tableFilters.group.pageSize = filterOptions.pageSize;
            tableFilters.group.currentOffset = filterOptions.currentOffset;
            tableFilters.group.searchField = filterOptions.searchField;
            tableFilters.group.sortField.fieldName = filterOptions.sortField.fieldName;
            tableFilters.group.sortField.sortOrder = filterOptions.sortField.sortOrder;
            break;
          case 'payer':
            tableFilters.payer.pageSize = filterOptions.pageSize;
            tableFilters.payer.currentOffset = filterOptions.currentOffset;
            tableFilters.payer.searchField = filterOptions.searchField;
            tableFilters.payer.sortField.fieldName = filterOptions.sortField.fieldName;
            tableFilters.payer.sortField.sortOrder = filterOptions.sortField.sortOrder;
            break;
        }
      } else {
        tableFilters = this.setDefaultFilterOptions(viewScreen, filterOptions);
      }
    }

    localStorage.setItem('tableFilters', JSON.stringify(tableFilters));
    return '';
  }

  /**
   * @ngdoc utilService
   * @name setTableFiltersInLocalStorage
   * @methodOf healtheNet.ui.service: UtilsService
   * @param viewScreen
   * @param filterOptions
   * @paramType string, object
   * @description
   * set filter options to default state when user navigates to other management screen
   */
  setDefaultFilterOptions(viewScreen, filterOptions) {
    let tableFilters;
    switch (viewScreen) {
      case 'user':
        tableFilters = {
          user: {
            pageSize: filterOptions.pageSize,
            currentOffset: filterOptions.currentOffset,
            searchField: filterOptions.searchField,
            sortField: {
              fieldName: filterOptions.sortField,
              sortOrder: filterOptions.sortOrder
            }
          },
          group: {},
          payer: {}
        };
        break;
      case 'group':
        tableFilters = {
          user: {},
          group: {
            pageSize: filterOptions.pageSize,
            currentOffset: filterOptions.currentOffset,
            searchField: filterOptions.searchField,
            sortField: {
              fieldName: filterOptions.sortField,
              sortOrder: filterOptions.sortOrder
            }
          },
          payer: {}
        };
        break;
      case 'payer':
        tableFilters = {
          user: {},
          group: {},
          payer: {
            pageSize: filterOptions.pageSize,
            currentOffset: filterOptions.currentOffset,
            searchField: filterOptions.searchField,
            sortField: {
              fieldName: filterOptions.sortField,
              sortOrder: filterOptions.sortOrder
            }
          }
        };
        break;
    }

    return tableFilters;
  }

  getAdxId(permissionName: string): string {
    // Get list of permission from local storage to fetch it's permission Id
    const permissionList = JSON.parse(localStorage.getItem('permissionList'));
    if (permissionList && permissionList.length > 0) {
      let permissionId = '';
      permissionList.forEach(permission => {
        if (permission.name === permissionName) {
            permissionId = permission.adxId;
        }
      });

      return permissionId;
    }

    return '';
  }

  /**
   * @ngdoc utilService
   * @name findAAARejections
   * @methodOf healtheNet.ui.service: UtilsService
   * @param referralArray
   * @paramType object
   * @description
   * traverse through the object to find and collect any AAA Rejections at any level and return them.
   */
  findAAARejections(referralArray, AAARejectionArray) {
    const responseKeys = this.getKeys(referralArray);

    responseKeys.forEach(eachKey => {
      const value = this.getValue(eachKey, referralArray);

      if (eachKey.includes('Rejections')) {
        const rejectionObject = this.getValue(eachKey, referralArray);

        if (Array.isArray(rejectionObject)) {
          rejectionObject.forEach(eachRejection => {
            AAARejectionArray.push(eachRejection);
          });
        } else {
          AAARejectionArray.push(rejectionObject);
        }
      } else {
        if (typeof value === 'object'  && !eachKey.includes('Rejections') && Object.keys(eachKey).length !== 0) {
          this.findAAARejections(value, AAARejectionArray);
        }
      }
    });

    return AAARejectionArray;
  }

  /**
   * @ngdoc utilService
   * @name getKeys
   * @methodOf healtheNet.ui.service: UtilsService
   * @param obj
   * @paramType object
   * @description
   * return keys of the object
   */
  private getKeys(obj) {
    return Object.keys(obj);
  }

  /**
   * @ngdoc utilService
   * @name getValue
   * @methodOf healtheNet.ui.service: UtilsService
   * @param key
   * @param object
   * @paramType String
   * @paramType Object
   * @description
   * return the value of the key in the provided object
   */
  private getValue(key: string, object): any {
    return object[key];
  }

  /**
   * @ngdoc utilService
   * @name getRejectionDisplayMessage
   * @methodOf healtheNet.ui.service: UtilsService
   * @param AAARejectionMessage
   * @paramType Object
   * @description
   * return the displayMessage
   */
  getRejectionDisplayMessage(AAARejectionMessage, displayMessage) {
    let reasonCodeMessage = '';
    let followupCodeMessage = '';

    // AAARejectionMessage = [{reasonCode: '', displayMessage: ''}, {followupCode: '',  displayMessage: ''}
    AAARejectionMessage.forEach(eachMessage => {
      if (eachMessage.reasonCode) {
        reasonCodeMessage = eachMessage.displayMessage;
      }
      if (eachMessage.followupCode) {
        followupCodeMessage = eachMessage.displayMessage;
      }
    });

    const rejectionMessage = reasonCodeMessage + ' - ' + followupCodeMessage;

    // Prepare the Rejection display message to be populated in the table
    // Reason Code - Followup Code (Comma separated if more than one)
    return !displayMessage ? rejectionMessage : displayMessage + ', ' + rejectionMessage;
  }

}
