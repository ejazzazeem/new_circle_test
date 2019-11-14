import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs/Observable';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable()
export class ReportingService {
  private baseUrl;

  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this.baseUrl = this.configService.getConfiguration().webApiBaseUrl;
  }

  getUserByUserId(userId): Observable<any> {
    return this.http.get(this.baseUrl + 'user/' + userId);
  }

  addUserReport(obj): Observable<any> {
    return this.http.post(this.baseUrl + 'report/userreport', obj);
  }

  updateUserReport(reportId, Obj): Observable<any> {
    return this.http.put(this.baseUrl + 'report/userreport/' + reportId, Obj);
  }

  deleteUserReport(reportId): Observable<any> {
    return this.http.delete(this.baseUrl + 'report/userreport/' + reportId);
  }

  getBaseReports(): Observable<any> {
    return this.http.get(this.baseUrl + 'report/getbasereports');
  }

  getUserReports(): Observable<any> {
    return this.http.get(this.baseUrl + 'report/getuserreports');
  }

  getAuthorizedContacts(): Observable<any> {
    return this.http.get(this.baseUrl + 'report/authorizedcontact');
  }

  getActiveProviders(breakdown: string, facilityName: string, taxId: string, payerId: string): Observable<any> {
    let params = new HttpParams();

    if (facilityName) {
      params = params.set('facilityname', facilityName);
    }
    if (taxId) {
      params = params.set('taxid', taxId);
    }
    if (payerId) {
      params = params.set('payerid', payerId);
    }
    if (breakdown) {
      params = params.set('breakdown', breakdown.toLowerCase());
    }

    return this.http.get(this.baseUrl + 'report/activeprovider', {params: params});
  }

  getParticipatingProviders(): Observable<any> {
    return this.http.get(this.baseUrl + 'report/participatingproviders');
  }

  getLoginLogoutDetails(userId: string, lastName: string, fromDate: any, toDate: any): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('lastname', lastName);
    }

    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    return this.http.get(this.baseUrl + 'report/userdetail', {params: params});
  }

  getUserListByOrganization(UserListByOrganizationParams: object): Observable<any> {
    return this.http.post(this.baseUrl + 'report/userlistbyorganization', UserListByOrganizationParams);
  }

  getTransactionHourAverages(payerId: string, fromDate: string, toDate: string, userType: string): Observable<any> {
    let params = new HttpParams();
    if (payerId) {
      params = params.set('payerid', payerId);
    }
    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    if (userType) {
      params = params.set('usertype', userType);
    }

    return this.http.get(this.baseUrl + 'report/transactionhouravegrages', {params: params});
  }

  getNoActivityUsers(startDate, endDate): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }

    return this.http.get(this.baseUrl + 'report/noactivityusers', {params: params});
  }

  getActiveUsersByDateRange(userId: string, lastName: string, fromDate: string, toDate: string): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('lastname', lastName);
    }

    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    return this.http.get(this.baseUrl + 'report/activeuserbydaterange', {params: params});
  }

  getPracticeFacilityListByName(faciltyname: string, status: string): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (faciltyname) {
      params = params.set('faciltyname', faciltyname);
    }
    return this.http.get(this.baseUrl + 'report/practicefacility', {params: params});
  }

  getHighvolumeUsers(volume: string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }
    if (volume) {
      params = params.set('volume', volume);
    }
    return this.http.get(this.baseUrl + 'report/highvolumeuser', {params: params});
  }


  getTransactionTotals(breakDown: string, userId: string, lastName: string, payerName: string,
                       startDate: any, endDate: any, groupName: string): Observable<any> {
    let params = new HttpParams();
    if (breakDown) {
      params = params.set('breakdown', breakDown);
    }
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('userlastname', lastName);
    }
    if (payerName) {
      params = params.set('payername', payerName);
    }
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }
    if (groupName) {
      params = params.set('groupname', groupName);
    }

    return this.http.get(this.baseUrl + 'report/totaltransactions', {params: params});
  }

  getAllGroups(keyword: string): Observable<any> {
    return this.http.get(this.baseUrl + 'group/find?keyword=' + keyword);
  }

  getNetExChangeUsageReport(filter, userId, payer, startdate, enddate) {
    let params = new HttpParams();
    if (filter) {
      params = params.set('breakdown', filter);
    }
    if (userId) {
      params = params.set('userid', userId);
    }
    if (payer) {
      params = params.set('payername', payer);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    return this.http.get(this.baseUrl + 'report/netexchangeusage', {params: params});
  }

  getTop100TransactionTotal(payer, startdate, enddate) {
    let params = new HttpParams();
    if (payer) {
      params = params.set('payername', payer);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    return this.http.get(this.baseUrl + 'report/tophundredtransactionhourpeaks', {params: params});
  }

  fetchRecentTransactionSuccess(payer, timePeriod, transactionType) {
    let params = new HttpParams();
    if (timePeriod) {
      params = params.set('timeperiod', timePeriod);
    }
    if (payer) {
      params = params.set('payername', payer);
    }
    if (transactionType) {
      params = params.set('transactiontype', transactionType);
    }
    return this.http.get(this.baseUrl + 'report/recenttransactions', {params: params});
  }

  fetchConcurrentLoggedInUsers(timePeriod, timeZone) {

    let params = new HttpParams();
    if (timePeriod) {
      params = params.set('timeperiod', timePeriod);
    }
    if (timeZone) {
      params = params.set('timezone', timeZone);
    }
    return this.http.get(this.baseUrl + 'report/concurrentloggedinuser', {params: params} );
  }

  createCsv(headerData, bodyData) {
    let header = '';
    for (let i = 0; i < headerData.children.length; i++) {
      if (i === 0 || i === headerData.children.length) {
        header = header + headerData.children[i].innerText;
      } else {
        header = header + ',' + headerData.children[i].innerText;
      }
    }
    const rows = [];
    rows.push(header);
    let singleRow = '';
    for (let i = 0; i < bodyData.children.length; i++) {
      singleRow = '';
      if (bodyData.children[i].className.indexOf('cp-3rd-level-row') !== -1) {
        rows.push(this.processSingleRow(bodyData.children[i]));
      }
      for (let j = 0; j < bodyData.children[i].children.length; j++) {
        if (bodyData.children[i].children[j].className === 'cp-row-inner') {
          rows.push(this.processSingleRow(bodyData.children[i].children[j]));
        } else {
          const innerNodes = bodyData.children[i].children[j];
          for (let k = 0; k < innerNodes.children.length; k++) {
            rows.push(this.processSingleRow(innerNodes.children[k]));
          }
        }
      }

    }

    return rows.join('\n');
  }

  create3rdLevelCsv(headerData, bodyData) {
    let header = '';
    for (let i = 0; i < headerData.children.length; i++) {
      if (i === 0 || i === headerData.children.length) {
        header = header + headerData.children[i].innerText;
      } else {
        header = header + ',' + headerData.children[i].innerText;
      }
    }
    const rows = [];
    rows.push(header);
    let singleRow = '';

    for (let i = 0; i < bodyData.children.length; i++) {
      singleRow = '';
      if (bodyData.children[i].className === 'cp-3rd-level-row') {
        rows.push(this.processSingleRow(bodyData.children[i]));
      } else if (bodyData.children[i].className === 'collapsible-body') {
        const bodyElement = bodyData.children[i];
        for (let j = 0; j < bodyElement.children.length; j++) {
          const cpRow = bodyElement.children[j];
          for (let k = 0; k < cpRow.children.length; k++) {
            if (cpRow.children[k].className === 'cp-row-inner') {
              rows.push(this.processSingleRow(cpRow.children[k]));
            } else {
              for (let w = 0; w < cpRow.children[k].children.length; w++) {
                rows.push(this.processSingleRow(cpRow.children[k].children[w]));
              }
            }
          }
        }
      }

    }

    return rows.join('\n');
  }

  processSingleRow(nodes) {
    let result = '';
    for (let i = 0; i < nodes.children.length; i++) {
      let currentText = nodes.children[i].innerText;
      if (nodes.children[i].children.length > 1) {
        currentText = this.getText(nodes.children[i]);
      }
      if (i === 0 || i === nodes.children.length) {
        result = result + '"' + currentText + '"';
      } else {
        result = result + ',' + '"' + currentText + '"';
      }
    }
    return result;

  }

  getText(nodes) {
    let result = '';
    for (let i = 0; i < nodes.children.length; i++) {
      result = result + nodes.children[i].innerText;
    }
    return result;
  }


  printReport(contents) {
    const popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../../../assets/print.css" /></head><body onload="window.print();" onafterprint="window.close()">' + contents + '</body></html>');
    popupWin.document.close();
  }

  downloadReport(csv, reportName) {
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvUrl = URL.createObjectURL(blob);

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, reportName);
    } else {
      const link = document.createElement('a');
      link.setAttribute('href', csvUrl);
      link.setAttribute('download', reportName);
      link.click();
    }

  }

  //activeUserByDate Range
  getPagedActiveUsersByDateRange(userId: string, lastName: string, fromDate: string, toDate: string, offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('lastname', lastName);
    }

    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    if (offSet) {
      params = params.set('offset', offSet);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedactiveuserbydaterange', {params: params});
  }

//authorizecontact
  getPagedAuthorizedContacts(offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (offSet) {
      params = params.set('offset', offSet);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedauthorizedcontact', {params: params});
  }

  //noactivity user
  getPagedNoActivityUsers(startDate, endDate, offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }
    if (offSet) {
      params = params.set('offset', offSet);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatednoactivityusers', {params: params});
  }

//participating providers
  getPagedParticipatingProviders(offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (offSet) {
      params = params.set('offset', offSet);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedparticipatingproviders', {params: params});
  }

  //practiceFacility
  getPagedPracticeFacilityListByName(faciltyname: string, status: string, offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (faciltyname) {
      params = params.set('faciltyname', faciltyname);
    }
    if (offSet) {
      params = params.set('offset', offSet);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedpracticefacility', {params: params});
  }

  // login-logout users (level-1)
  getLoggedInUser(userId: string, lastName: string, fromDate: any, toDate: any, role, offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('lastname', lastName);
    }

    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (offSet) {
      params = params.set('pageoffset', offSet);
    }
    if (pageSize) {
      params = params.set('pagesize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/loginlogoutdetails', {params: params});
  }

  // login-logout users (level-2)
  getLogInLogOutUserDetails(userId: string, lastName: string, fromDate: any, toDate: any, role, offSet, pageSize): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userid', userId);
    }
    if (lastName) {
      params = params.set('lastname', lastName);
    }

    if (fromDate) {
      params = params.set('fromdate', fromDate);
    }
    if (toDate) {
      params = params.set('todate', toDate);
    }
    if (role) {
      params = params.set('role', role);
    }

    if (offSet) {
      params = params.set('pageoffset', offSet);
    }
    if (pageSize) {
      params = params.set('pagesize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/loginlogoutdetailsbyuserid', {params: params});
  }

  // netexchange grand totals
  getNEgrandTotals(userid, payername, startdate, enddate) {
    let params = new HttpParams();
    if (userid) {
      params = params.set('userid', userid);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    return this.http.get(this.baseUrl + 'report/netexchangeusagegrandtotal', {params: params});
  }

  // netexchange report by user
  getNEreportByUser(breakdown, userid, payername, startdate, enddate, year, month, pageoffset, pagesize): Observable<any> {
    let params = new HttpParams();
    if (breakdown) {
      params = params.set('breakdown', breakdown);
    }
    if (userid) {
      params = params.set('userid', userid);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    if (year) {
      params = params.set('year', year);
    }
    if (month) {
      params = params.set('month', month);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/netexchangeusageofusers', {params: params});

  }

  //netexchangeusageofmonths
  getNEreportByMonths(userid, payername, startdate, enddate, pageoffset, pagesize): Observable<any> {
    let params = new HttpParams();

    if (userid) {
      params = params.set('userid', userid);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/netexchangeusageofmonths', {params: params});

  }


  // netexchange report by payer
  getNEreportByPayer(breakdown, userid, payername, startdate, enddate, year, month, pageoffset, pagesize): Observable<any> {

    let params = new HttpParams();
    if (breakdown) {
      params = params.set('breakdown', breakdown);
    }
    if (userid) {
      params = params.set('userid', userid);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }
    if (year) {
      params = params.set('year', year);
    }
    if (month) {
      params = params.set('month', month);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/netexchangeusageofpayers', {params: params});

  }

// recent transactionsTotals
  getRecentTransactionGrande(timeperiod, payername, transactiontype): Observable<any> {
    let params = new HttpParams();
    if (timeperiod) {
      params = params.set('timeperiod', timeperiod);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (transactiontype) {
      params = params.set('transactiontype', transactiontype);
    }
    return this.http.get(this.baseUrl + 'report/recenttransactionsgrandtotal', {params: params});
  }

  getPaginatedRecentTransactions(timeperiod, payername, transactiontype, offset, pageSize): Observable<any> {

    let params = new HttpParams();
    if (timeperiod) {
      params = params.set('timeperiod', timeperiod);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (transactiontype) {
      params = params.set('transactiontype', transactiontype);
    }
    if (offset) {
      params = params.set('offset', offset);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedrecenttransactionpayers', {params: params});
  }

  getRecentTransactionsByPayer(timeperiod, payername, transactiontype): Observable<any> {
    let params = new HttpParams();
    if (timeperiod) {
      params = params.set('timeperiod', timeperiod);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (transactiontype) {
      params = params.set('transactiontype', transactiontype);
    }
    return this.http.get(this.baseUrl + 'report/recenttransactionbypayer', {params: params});

  }

  //high vclumn
  PaginatedgetHighvolumeUsers(volume: string, startDate: string, endDate: string, pageoffset, pagesize): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }
    if (volume) {
      params = params.set('volume', volume);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/paginatedhighvolumeusers', {params: params});
  }

  highvolumeUsersByDate(groupbydate: string, volume: string, startDate: string, endDate: string, pageoffset, pagesize): Observable<any> {

    let params = new HttpParams();
    if (groupbydate) {
      params = params.set('groupbydate', groupbydate);
    }
    if (startDate) {
      params = params.set('startdate', startDate);
    }
    if (endDate) {
      params = params.set('enddate', endDate);
    }
    if (volume) {
      params = params.set('volume', volume);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/highvolumeusersbydate', {params: params});
  }

  getGrandTotalsHighVolume(volume, startdate, enddate ): Observable<any> {
    let params = new HttpParams();
    if (volume) {
      params = params.set('volume', volume);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }

    return this.http.get(this.baseUrl + 'report/highvolumeusergrandtotal', {params: params});
  }

  //user list by Organization

  getPaginatedFacilityNames(userid: string, facilityname: string, pageoffset, pagesize): Observable<any> {
    let params = new HttpParams();
    if (userid) {
      params = params.set('userid', userid);
    }

    if (facilityname) {
      params = params.set('facilityname', facilityname);
    }
    if (facilityname) {
      params = params.set('facilityname', facilityname);
    }
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/getpaginatedfacilityNames', {params: params});
  }
  getPaginatedUsersByFacilityNames(userid: string, facilityname: string, facilitynameslist: string, pageoffset, pagesize): Observable<any> {
    let params = new HttpParams();
    if (userid) {
      params = params.set('userid', userid);
    }

    if (facilityname) {
      params = params.set('facilityname', facilityname);
    }
      params = params.set('facilitynameslist', facilitynameslist);
    if (pageoffset) {
      params = params.set('pageoffset', pageoffset);
    }
    if (pagesize) {
      params = params.set('pagesize', pagesize);
    }
    return this.http.get(this.baseUrl + 'report/getpaginateduserlistbyfacilitynames', {params: params});
  }

  getPaginatedTransactionTotals(breakdown, userid, userlastname, payername, startdate,
                                enddate, groupname, month, year, userthenprovider, pageSize, offset): Observable<any> {

    let params = new HttpParams();
    if (breakdown) {
      params = params.set('breakdown', breakdown);
    }

    if (userid) {
      params = params.set('userid', userid);
    }
    if (userlastname) {
      params = params.set('userlastname', userlastname);
    }
    if (payername) {
      params = params.set('payername', payername);
    }
    if (startdate) {
      params = params.set('startdate', startdate);
    }
    if (enddate) {
      params = params.set('enddate', enddate);
    }

    if (groupname) {
      params = params.set('groupname', groupname);
    }
    if (month) {
      params = params.set('month', month);
    }
    if (year) {
      params = params.set('year', year);
    }
    if (userthenprovider) {
      params = params.set('userthenprovider', userthenprovider);
    }
    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }
    if (offset) {
      params = params.set('offset', offset);
    }
    return this.http.get(this.baseUrl + 'report/paginatedtotaltransactions', {params: params});
  }

    getPaginatedTransactionTotalsByMonth(userid, userlastname, payername, startdate,
                                  enddate,  groupname, pageSize, offset): Observable<any> {

        let params = new HttpParams();

        if (userid) {
            params = params.set('userid', userid);
        }
        if (userlastname) {
            params = params.set('userlastname', userlastname);
        }
        if (payername) {
            params = params.set('payername', payername);
        }
        if (startdate) {
            params = params.set('startdate', startdate);
        }
        if (enddate) {
            params = params.set('enddate', enddate);
        }
        if (groupname) {
            params = params.set('groupname', groupname);
        }
        if (pageSize) {
            params = params.set('pageSize', pageSize);
        }
        if (offset) {
            params = params.set('offset', offset);
        }
        return this.http.get(this.baseUrl + 'report/paginatedtotaltransactionmonths', {params: params});
    }

    getPaginatedTransactionTotalsByUsers(userid, userlastname, payername, startdate,
                                         enddate,  groupname, pageSize, offset): Observable<any> {

        let params = new HttpParams();

        if (userid) {
            params = params.set('userid', userid);
        }
        if (userlastname) {
            params = params.set('userlastname', userlastname);
        }
        if (payername) {
            params = params.set('payername', payername);
        }
        if (startdate) {
            params = params.set('startdate', startdate);
        }
        if (enddate) {
            params = params.set('enddate', enddate);
        }
        if (groupname) {
            params = params.set('groupname', groupname);
        }
        if (pageSize) {
            params = params.set('pageSize', pageSize);
        }
        if (offset) {
            params = params.set('offset', offset);
        }
        return this.http.get(this.baseUrl + 'report/paginatedtotaltransactionusers', {params: params});
    }

    getGrandTransactionTotals(userid, userlastname, payername, startdate,
                                         enddate,  groupname): Observable<any> {

        let params = new HttpParams();

        if (userid) {
            params = params.set('userid', userid);
        }
        if (userlastname) {
            params = params.set('userlastname', userlastname);
        }
        if (payername) {
            params = params.set('payername', payername);
        }
        if (startdate) {
            params = params.set('startdate', startdate);
        }
        if (enddate) {
            params = params.set('enddate', enddate);
        }
        if (groupname) {
            params = params.set('groupname', groupname);
        }

        return this.http.get(this.baseUrl + 'report/totaltransactionsgrandtotal', {params: params});
    }

    associatedProviders(facilityname, taxid, userid, payername, breakdown, pageSize,offset  ): Observable<any> {
        let params = new HttpParams();

        if (facilityname) {
          params = params.set('facilityname', facilityname);
        }
        if (taxid) {
          params = params.set('taxid', taxid);
        }
        if (userid) {
          params = params.set('userid', userid);
        }
        if (payername) {
          params = params.set('payername', payername);
        }
        if (breakdown) {
          params = params.set('breakdown', breakdown);
        }
        if (pageSize) {
          params = params.set('pageSize', pageSize);
        }
        if (offset) {
          params = params.set('offset', offset);
        }

        return this.http.get(this.baseUrl + 'report/paginatedassociatedprovider', {params: params});
    }

    downloadReportCSV(baseReport, filterParams, reportName) {
      const csvUrl = this.baseUrl + 'report/downloadcsv?basereportid=' + baseReport.baseReportId + '&reportname='  + baseReport.baseReportName  + '&filterparams=' +
          encodeURI( JSON.stringify(filterParams));
      const _name = reportName + new Date().toISOString();
      const link = document.createElement('a');
      link.setAttribute('href', csvUrl);
      link.setAttribute('download', _name);
      link.click();
    }

  downloadReportPdf(baseReport, filterParams, reportName) {
    const pdfUrl = this.baseUrl + 'report/downloadpdf?basereportid=' + baseReport.baseReportId + '&reportname='  + baseReport.baseReportName  + '&filterparams=' +
        encodeURI( JSON.stringify(filterParams));
    const _name = reportName + new Date().toISOString();
    const link = document.createElement('a');
    link.setAttribute('href', pdfUrl);
    link.setAttribute('download', _name);
    link.click();
  }
}
