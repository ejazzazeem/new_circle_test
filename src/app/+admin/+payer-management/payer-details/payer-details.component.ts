import {Component, OnInit, AfterViewInit, ViewEncapsulation,  ViewChildren, QueryList, OnDestroy,
    ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { MatDialog } from '@angular/material';
import { TransactionSettingsComponent, CustomTransactionDialogComponent } from '@misc/admin/index';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import 'rxjs/add/observable/of';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPayerService , PayerDetailsService, AlertService, LoaderService, GetGroupsService } from '@services/index';
import { Payer, AddPermission, PayerProvider, Page, SortFields, DataRequest } from '@models/index';
import * as moment from 'moment';
@Component({
    selector: 'app-payer-details',
    templateUrl: './payer-details.component.html',
    styleUrls: ['./payer-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PayerDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<PayerProvider> = new Subject();

    model: any = {};
    payerModel: Payer = {} as Payer;
    transportType: any;
    username: any;
    password: any;
    endpoint: any;
    payerId: string;
    payerStatus: boolean;
    filteredResults;
    payerTransactions;
    emptyCustomMessage = true;
    editPath = false;
    folderPath = '';
    pathClass = 'path-value';
    uploadTime;
    payerRegions: any = {};
    selectedPayerRegions: any = [];
    // server side pagination
    pageSize = 100;
    currentOffset = 0;
    totalPages = 0;
    preClass = 'pre disabled';
    nextClass = 'next';
    totalRecords = 0;
    keyword = '';
    sortClasses = {
      id: 'sort-icon',
      firstName: 'sort-icon',
      lastName: 'sort-icon',
      taxId: 'sort-icon',
      specialty: 'sort-icon',
      npi: 'sort-icon'
    };
    sortCol = 'id';
    sortOrder = 'ASC';

    receiverCode = '';
    payerIdCode = '';
    coreSenderID = '';
    totalProviders = 0;

    titleName = 'payer';
    selectedTaxID = '';
    selectedTab = 0;

    showRecords = false;
    private unSubscribe = new Subject();
    createdUpdatedInfo: any = {};
    txtQuery: string;
    txtQueryChanged: Subject<string> = new Subject<string>();
    constructor( public dialog: MatDialog,
                 private route: ActivatedRoute,
                 private loaderService: LoaderService,
                 private router: Router,
                 private addPayerService: AddPayerService,
                 private payerDetailsService: PayerDetailsService,
                 private alertService: AlertService,
                 private cdr: ChangeDetectorRef) {
      // debounce
      this.txtQueryChanged
        .debounceTime(1000) // wait 1 sec after the last event before emitting last event
        .distinctUntilChanged() // only emit if value is different from previous value
        .takeUntil(this.unSubscribe)
        .subscribe(model => {
          this.txtQuery = model;

          // Call your function which calls API or do anything you would like do after a lag of 1 sec
          this.onSearchChange(this.txtQuery);
        });
    }

    ngOnInit() {
        this.dtOptions = {
            scrollY: '500px',
            scrollCollapse: true,
            pagingType: 'full_numbers',
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No  provider found for this payer'
            }
        };

        this.payerId = this.route.snapshot.paramMap.get('id');
        this.loaderService.display(true);
        this.addPayerService.getPayerDetail(this.payerId).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.payerModel = data;
                this.createdUpdatedInfo = data.createdUpdatedInfo;
                if (this.createdUpdatedInfo.createdTime !== null && this.createdUpdatedInfo.createdTime !== undefined) {
                    this.createdUpdatedInfo.createdTime =  moment(this.createdUpdatedInfo.createdTime).format('YYYY-MM-DD hh:mm:ss');
                }
                if (this.createdUpdatedInfo.updatedTime !== null && this.createdUpdatedInfo.updatedTime !== undefined) {
                    this.createdUpdatedInfo.updatedTime =  moment(this.createdUpdatedInfo.updatedTime).format('YYYY-MM-DD hh:mm:ss');
                }
                this.cdr.detectChanges();
                this.payerStatus = data.status === 'ACTIVE';
                this.transportType = data.connectivity.transportType;
                this.username = data.connectivity.username;
                this.password = data.connectivity.password;
                this.endpoint = data.connectivity.endPoint;
                this.receiverCode = data.receiverCode;
                this.payerIdCode = data.payerIdCode;
                this.coreSenderID = data.coreSenderId;
                this.payerRegions = data.regions;
                this.setPayerRegionList(this.payerRegions);

            }, error => {
                this.loaderService.display(false);
                if (error.error.errors[0].endUserMessage.includes('Payer not found against provided id:')) {
                    this.alertService.error(error.error.errors[0].endUserMessage + ' Redirecting to Payer List.');
                    setTimeout(() => {
                        this.returnToList();
                    }, 3000);
                } else {
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            });

    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }

    loadContents(index) {
        if (index === 1) {
            this.payerDetailsService.getPayerTransactions(this.payerId).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.emptyCustomMessage = true;
                    this.payerTransactions = data;
                    this.cdr.detectChanges();
                    this.payerTransactions.forEach(obj => {
                        if (obj.custom === true && this.emptyCustomMessage) {
                            this.emptyCustomMessage = false;
                        }
                    });
                },
                error => {
                    this.alertService.error(error.error.errors[0].endUserMessage);

                }
            );

        } else if (index === 2) {
            this.loaderService.display(true);
            this.editPath = false;
            this.pathClass = 'path-value';
            this.filterResults();
        } else if (index === 3) {
             this.selectedTaxID = '';
            this.selectedTab = 2;
        }
    }

    openDialog(data) {

        const dialogRef = this.dialog.open(TransactionSettingsComponent, {
            data: {
                'transactionData': data,
                'payerId' : this.payerId
            }
        });
        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {

            if (result !== undefined) {
                this.payerDetailsService.updateTransaction(this.payerId, result.permissionId, result)
                    .takeUntil(this.unSubscribe).subscribe(
                    updateResult => {
                        this.alertService.success('Transaction updated successfully');
                        setTimeout(() => { this.loadContents(1); }, 3000);

                    },
                    error => {
                        console.error(error);
                    }
                );


            }
        });
    }

    addCustomTransaction() {
        const dialogRef = this.dialog.open(CustomTransactionDialogComponent, {
            data: {'payerId': this.payerId}
        });
        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
            if (result) {
                const addPermission: AddPermission = { name: result, custom: true, enabled: true };

                this.payerDetailsService.createCustomTransaction(this.payerId, addPermission)
                    .takeUntil(this.unSubscribe).subscribe(
                    data => {
                        if (data.permissionId !== undefined && data.permissionId !== null) {
                            this.alertService.success('Transaction added successfully');
                            setTimeout(() => { this.loadContents(1); }, 3000);
                        }
                    },
                    error => {
                        this.alertService.error(error.error.errors[0].endUserMessage);
                    }
                );


            }
        });
    }

    removeCustomTransactions(permission) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete this transaction ?',
                componentName: 'PayerDetailsComponent'
            }
        });

        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
            if (result === 'yes') {
                this.payerDetailsService.removeCustomTransaction(this.payerId, permission.permissionId)
                    .takeUntil(this.unSubscribe).subscribe(
                    data => {
                        this.alertService.success('Transaction removed successfully');
                        setTimeout(() => { this.loadContents(1); }, 3000);
                    },
                    error => {
                        this.alertService.error(error.error.errors[0].endUserMessage);
                    }
                );
            }

        });

    }

    ToggleTransaction( transaction) {

        this.payerDetailsService.updateTransaction(this.payerId, transaction.permissionId, transaction)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                this.alertService.success('Transaction updated successfully');
                setTimeout(() => { this.loadContents(1); }, 3000);
            },
            error => {
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }


    returnToList() {
        this.router.navigate(['/admin/payerManagement']);
    }


    editContentPath() {
        this.editPath = true;
        this.pathClass = 'path-value edit';
    }

    updateNetworkPath() {

        this.payerDetailsService.updateNetworkPath(this.payerId, this.folderPath )
            .takeUntil(this.unSubscribe).subscribe(
            data => {
            this.alertService.success('Network Path updated successfully');
                this.loadContents(2);
            },
            error => {
                this.alertService.error(error.error.errors[0].endUserMessage);
                this.loadContents(2);
            }
        );
    }


    setPayerRegionList(selectedRegions) {

        // Loads Region Type List
        this.addPayerService.getPayerRegionList().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.cdr.detectChanges();

                data.forEach(allRegionObj => {

                    selectedRegions.forEach(selectedRegionObj => {
                            if (allRegionObj.regionId === selectedRegionObj) {
                                this.selectedPayerRegions.push({regionId: allRegionObj.regionId , name: allRegionObj.name, checked: true });
                            }
                        });
                });
                this.loaderService.display(false);

            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    // Pagination Code starts  -------------------------------------
    updatePageSize(event) {
        this.pageSize = event.value;
        this.currentOffset = 0;
        this.filterResults();
    }

    nextPage(cls) {
        if (cls === 'next disabled') {
            return false;
        }

        this.currentOffset = this.currentOffset + 1;
        this.filterResults();
    }

    prevPage(cls) {
        if (cls === 'pre disabled') {
            return false;
        }

        this.currentOffset = this.currentOffset - 1;
        this.filterResults();
    }


    filterResults() {
        this.loaderService.display(true);
      if (this.sortCol  !== '') {
        for (const key in this.sortClasses) {
          if (key === this.sortCol) {
            this.sortClasses[key] = this.sortOrder === 'DESC' ? 'sort-icon dec' : 'sort-icon asc';
          } else {
            this.sortClasses[key] = 'sort-icon';
          }
        }
      } else {
        this.sortCol = 'id';
      }
        const sortFields: SortFields  = {
            fieldName: this.sortCol,
            sortOrder: this.sortOrder
    };
        const page: Page = {
            offSet : this.currentOffset,
            size : this.pageSize
        };
        const groupRequest: DataRequest = {
            keyword : this.keyword,
            sortField : {
                page : page,
                sortField: sortFields
            }
        };

        this.payerDetailsService.getpayerProviders(this.payerId,  groupRequest)
            .takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.filteredResults =  data.results;
                 //   this.cdr.detectChanges();
                    this.uploadTime = data.results.payerProviderUpload.uploadTime;
                    if (this.uploadTime !== null) {
                        this.uploadTime = moment(this.uploadTime).format('YYYY-MM-DD hh:mm:ss');
                    }

                    this.totalRecords =  data.totalCount;
                    if ( this.totalRecords % this.pageSize === 0 ) {
                        this.totalPages =  this.totalRecords / this.pageSize ;
                    } else {
                        this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
                    }

                    this.nextClass =
                        ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
                    this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
                    if (this.totalPages === 0) {
                        this.nextClass = 'next disabled';
                    }
                    this.dtElements.forEach((dtElement) => {
                        if (dtElement.dtInstance !== undefined) {
                            dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                                // Destroy the table first
                                dtInstance.destroy();
                                // Call the dtTrigger to rerender again
                               dtElement.dtTrigger.next();

                            });
                        }

                    });
                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );
    }
    filterResultSortOrder(sortCol: string, sortOrder: string) {
      this.sortCol = sortCol;
      this.sortOrder = sortOrder;
      this.filterResults();
    }
    // Pagination Code Ends  -------------------------------------

  // keyword search Starts ----------------------------
    onFieldChange(query: string) {
      this.txtQueryChanged.next(query);
    }
    onSearchChange(searchValue: string) {
      this.keyword = (searchValue.length > 1) ? searchValue : '';
      this.currentOffset = 0;
      this.filterResults();
    }
    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}



