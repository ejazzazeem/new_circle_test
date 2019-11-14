// Service to share data across sibling components

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataSharingService {
  private multipleResponse = new BehaviorSubject<object>({});
  getMultipleResponse = this.multipleResponse.asObservable();

  private singleResponseDetail = new BehaviorSubject<object>({});
  getSingleResponseDetail = this.singleResponseDetail.asObservable();

  private navigateToOtherTransaction = new BehaviorSubject<object>({});
  getNavigateToOtherTransaction = this.navigateToOtherTransaction.asObservable();

  private claimFormData = new BehaviorSubject<object>({});
  getClaimFormData = this.claimFormData.asObservable();

  private permissionsList =  new BehaviorSubject<object>({});
  getPermissionsList = this.permissionsList.asObservable();

  private noResponseDetail = new BehaviorSubject<object>({});
  getNoResponseFromPayerDetail = this.noResponseDetail.asObservable();

  private getFormData = new BehaviorSubject<object>({});
  getFormDataFromInquiryForm = this.getFormData.asObservable();

  private getPrintData = new BehaviorSubject<object>({});
  getPrintDataFromInquiryDetails = this.getPrintData.asObservable();

  constructor() {}

  setMultipleResponse(response: any) {
    this.multipleResponse.next(response);
  }

  setSingleResponseDetail(response: any) {
    this.singleResponseDetail.next(response);
  }
  setNavigateToOtherTransaction(response: any) {
    this.navigateToOtherTransaction.next(response);
  }

  setClaimFormData(response: any) {
    this.claimFormData.next(response);
  }

  setPermissionsList(response: any) {
    this.permissionsList.next(response);
  }

  setDataIfNoResponseFromPayer(response: any) {
    this.noResponseDetail.next(response);
  }

  setFormDataFromInquiryForm(response: any) {
    this.getFormData.next(response);
  }

  setPrintDataFromInquiryDetails(response: any) {
    this.getPrintData.next(response);
  }

}
