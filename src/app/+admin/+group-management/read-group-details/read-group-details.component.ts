import {Component, OnInit, ViewEncapsulation,
AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import {GetGroupsService, AlertService, LoaderService} from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import * as moment from 'moment';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'app-read-group-details',
    templateUrl: './read-group-details.component.html',
    styleUrls: ['./read-group-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ReadGroupDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    dtOptions: DataTables.Settings = {};
    dtTriggerUser: Subject<any> = new Subject();

    model: any = {};
    status: boolean;
    allDataFetched = false;
    filteredResults;
    groupID = '';
    line1 = '';
    line2 = '';
    city = '';
    state = '';
    zipCode = '';
    county = '';
    region = '';
    selectedTaxID = '';
    selectedTab = 0;
    titleName = 'group';
    showRecords = false;
    createdUpdatedInfo: any = {};
    showAllUsers = false;
    private unSubscribe = new Subject();
    resultOptions: any = {
      userCount: 0,
      pageSize: 10,
      currentOffset: 0,
      totalPages : 0
    };
    // Sort Field and Sort Order
    sortField = 'lastName';
    sortOrder = 'ASC';
    keyword = '';
    sortClasses = {
      loginId: 'sort-icon',
      firstName: 'sort-icon',
      lastName: 'sort-icon',
      email: 'sort-icon',
    };
    preClass = 'pre disabled';
    nextClass = 'next';
    txtQuery: string;
    txtQueryChanged: Subject<string> = new Subject<string>();
    constructor(private router: Router,
                private getGroupsService: GetGroupsService,
                private route: ActivatedRoute,
                private alertService: AlertService,
                private loaderService: LoaderService,
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
        this.loaderService.display(true);
        this.groupID = this.route.snapshot.paramMap.get('id');
        this.dtOptions = {
            scrollY: '300px',
            scrollCollapse: true,
            pagingType: 'full_numbers',
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            paging: false,
            language: {
                emptyTable: 'No Group User Found'
            }
        };

        // Loads Group Details
        this.getGroupsService.getGroupByGroupId(this.groupID).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.model = data;
                this.createdUpdatedInfo = data.createdUpdatedInfo;
                if (this.createdUpdatedInfo.createdTime !== null && this.createdUpdatedInfo.createdTime !== undefined) {
                    this.createdUpdatedInfo.createdTime =  moment(this.createdUpdatedInfo.createdTime).format('YYYY-MM-DD hh:mm:ss');
                }
                if (this.createdUpdatedInfo.updatedTime !== null && this.createdUpdatedInfo.updatedTime !== undefined) {
                    this.createdUpdatedInfo.updatedTime =  moment(this.createdUpdatedInfo.updatedTime).format('YYYY-MM-DD hh:mm:ss');
                }
                this.cdr.detectChanges();
                if (this.model.address !== null) {
                    this.line1 = this.model.address.line1;
                    this.line2 = this.model.address.line2;
                    this.city = this.model.address.city;
                    this.state = this.model.address.state;
                    this.zipCode = this.model.address.zipCode;
                    this.county = this.model.address.county;
                    this.region = this.model.address.region;

                }

                this.status = this.model.status === 'ACTIVE';
                this.allDataFetched = true;
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                console.error(error);
            }
        );

    }

    ngAfterViewInit(): void {
        this.dtTriggerUser.next();
    }

    editGroup () {
        this.router.navigate(['admin/groupManagement/update', this.groupID]);
    }

    loadContents(index) {
        this.selectedTab = null;
        if (index === 1) {
            this.showRecords = false;
            this.filterResults(this.sortField, this.sortOrder);
        } else if (index === 2) {
            this.selectedTaxID = '';
            this.selectedTab = 2;
        }
    }

    getGroupUser(groupRequest) {
        this.loaderService.display(true);
        this.getGroupsService.getGroupUsers(this.groupID, groupRequest).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.filteredResults = data.results;
                this.resultOptions.currentOffset = data.pageOffSet;
                this.resultOptions.userCount = data.totalCount;
                 if (this.resultOptions.userCount % this.resultOptions.pageSize === 0 ) {
                    this.resultOptions.totalPages = this.resultOptions.userCount / this.resultOptions.pageSize ;
                 } else {
                     this.resultOptions.totalPages = Math.floor( this.resultOptions.userCount / this.resultOptions.pageSize) + 1;
                 }
                 this.nextClass =
                ((this.resultOptions.totalPages === (this.resultOptions.currentOffset + 1)) || this.resultOptions.totalPages === 0) ? 'next disabled' : 'next';
              this.preClass = (this.resultOptions.currentOffset === 0) ? 'pre disabled' : 'pre';
                this.cdr.detectChanges();
                this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );


    }

    returnToList() {
        this.router.navigate(['admin/groupManagement']);
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

    UpdateOptions() {
       this.showAllUsers = !this.showAllUsers;
    }

    filterResults(sortColumn, sortOrder) {
    this.loaderService.display(true);
    if (sortColumn  !== '') {
      for (const key in this.sortClasses) {
        if (key === sortColumn) {
          this.sortClasses[key] = sortOrder === 'DESC' ? 'sort-icon dec' : 'sort-icon asc';
        } else {
          this.sortClasses[key] = 'sort-icon';
        }
      }
    } else {
      sortColumn = 'firstName';
    }

    // Save the sorted Column in a variable to save in local storage
    this.sortField = sortColumn;

    const sortFields: SortFields  = {
      fieldName: sortColumn,
      sortOrder: sortOrder
    };

    const page: Page = {
      offSet : this.resultOptions.currentOffset,
      size : this.resultOptions.pageSize
    };
    const groupRequest: DataRequest = {
      keyword : this.keyword,
      sortField : {
        page : page,
        sortField: sortFields
      }
    };

    this.getGroupUser(groupRequest);
  }
    // Pagination Code starts  -------------------------------------
    updatePageSize(event) {
      this.resultOptions.pageSize = event.value;
      this.resultOptions.currentOffset = 0;
      this.filterResults(this.sortField, this.sortOrder);
    }
    nextPage(cls) {
      if (cls === 'next disabled') {
        return false;
      }
      this.resultOptions.currentOffset = this.resultOptions.currentOffset + 1;
      this.filterResults(this.sortField, this.sortOrder);
    }
    prevPage(cls) {
      if (cls === 'pre disabled') {
        return false;
      }
      this.resultOptions.currentOffset = this.resultOptions.currentOffset - 1;
      this.filterResults(this.sortField, this.sortOrder);
    }
    // Pagination Code Ends  -------------------------------------

    // keyword search Starts ----------------------------
    onFieldChange(query: string) {
      this.txtQueryChanged.next(query);
    }
    onSearchChange(searchValue: string) {
      this.keyword = (searchValue.length > 1) ? searchValue : '';
      this.resultOptions.currentOffset = 0;
      this.filterResults(this.sortField, this.sortOrder);
    }
}
