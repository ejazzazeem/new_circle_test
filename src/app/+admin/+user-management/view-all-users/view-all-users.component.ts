import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy,
ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { AlertService, LoaderService,
         GetUsersService, DeleteUserService, UtilsService } from '@services/index';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Page, SortFields, DataRequest } from '@models/index';
import 'rxjs/add/operator/distinctUntilChanged';
import { USER_ROLES } from '@misc/index';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
declare function isIE(): any;
import * as moment from 'moment';
@Component({
  selector: 'app-view-all-users',
  templateUrl: './view-all-users.component.html',
  styleUrls: ['./view-all-users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewAllUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  model: any = {
    userCount: 0,
    pageSize: 10,
    currentOffset: 0,
    totalPages : 0
  };

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new  Subject();
  filteredResults;
  preClass = 'pre disabled';
  nextClass = 'next';
  sortClasses = {
    loginId: 'sort-icon',
    firstName: 'sort-icon',
    lastName: 'sort-icon',
    role: 'sort-icon'
  };

  // Sort Field and Sort Order
  sortField = 'firstName';
  sortOrder = 'ASC';
  keyword = '';
  txtQuery: string;
  txtQueryChanged: Subject<string> = new Subject<string>();
  userRole = USER_ROLES;

  columnClicked: string;
  private unSubscribe = new Subject();
  currentRole = '';
  constructor( private router: Router,
               private deleteUserService: DeleteUserService,
               private getUsersService: GetUsersService,
               private alertService: AlertService,
               private loaderService: LoaderService,
               private utils: UtilsService,
               public dialog: MatDialog,
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
    this.dtOptions = {
      pagingType: 'full_numbers',
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No User Found'
      },
      columnDefs: [{'targets': [0], 'visible': false}],
      rowCallback: (row: Node, data: any[] | Object) => {
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          this.readUserRecord(data);
        });
        return row;
      }
    };
    const userObj = localStorage.getItem('currentUser');
    this.currentRole = JSON.parse(userObj).role;

    // If filters are present in local storage then display the filters else display default view.
    this.setTableFilterOptionsOnInit();

    // if browser is not IE and if searchWord is empty
    if (!isIE() && !this.txtQuery) {
      this.filterResults(this.sortField, this.sortOrder);
    }
  }

  /**
   * @ngdoc method
   * @name filterResults
   * @param sortColumn
   * @param sortOrder
   * @methodOf healtheNet.ui.component: ViewAllUsersComponent
   * @description
   * Set the Page Sorting and Pagination Payload to send to the server to
   * retrieve users accordingly.
   */
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
      offSet : this.model.currentOffset,
      size : this.model.pageSize
    };
    const userRequest: DataRequest = {
      keyword : this.keyword,
      sortField : {
        page : page,
        sortField: sortFields
      }
    };

    this.retrieveUsers(userRequest);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  populateRoles(role) {
    switch (role) {
      case 'PRACTICE_OFFICE_USER':
        return this.userRole.PRACTICE_ROLE;
      case 'PAYER_USER':
        return this.userRole.PAYER_ROLE;
      case 'NETEXCHANGE_ACCOUNT':
        return this.userRole.NETEXCHANGEROLE;
      case 'LEVEL_1_ADMINISTRATOR':
          return this.userRole.ADMIN1_ROLE;
      case 'LEVEL_2_ADMINISTRATOR':
          return this.userRole.ADMIN2_ROLE;
    }
  }

  populateGroups(data) {
    let result = '';
    if (data.length > 3) {
      data = data.slice(0, 3);
      data.forEach(obj => {
        result = (result === '') ? obj.name : result + ', ' + obj.name;
      });
      return result + ', ...';
    } else {
      data.forEach(obj => {
        result = (result === '') ? obj.name : result + ', ' + obj.name;
      });

      return result = (!result) ? '. . . . . .' : result;
    }
  }

  /**
   * @ngdoc method
   * @name deleteUser
   * @methodOf healtheNet.ui.component: ViewAllUsersComponent
   * @description
   * Call delete service to delete a user by user Id
   */
  deleteUser(rowData) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete "' + rowData[1] + '" ?',
        componentName: 'ViewAllUsersComponent'
      }
    });

    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result === 'yes') {
        this.loaderService.display(true);
        // Loads User Details
        this.deleteUserService.deleteUser(rowData[0]).takeUntil(this.unSubscribe).subscribe(
            data => {
              this.alertService.success('User Successfully Deleted.');
              setTimeout(() => {
                this.filterResults(this.sortField, this.sortOrder);
              }, 1000);
            },
            error => {
              this.loaderService.display(false);
              this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
      }
      this.columnClicked = '';
    });
  }

  /**
   * @ngdoc method
   * @name retrieveUsers
   * @param userRequest
   * @methodOf healtheNet.ui.component: ViewAllUsersComponent
   * @description
   * Call service to fetch all users.
   */
  retrieveUsers(userRequest) {
    // Loads User Details
    this.getUsersService.retrieveAllUsers(userRequest).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.filteredResults = data.results;
          this.model.userCount =  data.totalCount;

          // Set the filter Options in local storage to be 'remembered' for later.
          this.setTableFilterOptions('user');

          if (this.model.userCount % this.model.pageSize === 0 ) {
            this.model.totalPages = this.model.userCount / this.model.pageSize ;
          } else {
            this.model.totalPages = Math.floor( this.model.userCount / this.model.pageSize) + 1;
          }

          this.nextClass =
              ((this.model.totalPages === (this.model.currentOffset + 1)) || this.model.totalPages === 0) ? 'next disabled' : 'next';
          this.preClass = (this.model.currentOffset === 0) ? 'pre disabled' : 'pre';

          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtTrigger.next();
            this.loaderService.display(false);
          }).catch(error => {
            this.loaderService.display(false);
              console.error('Error getting data table for all users. ' + error);
          });
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  // navigate to read user Screen to display the record when clicked on a table row.
  readUserRecord(rowData) {
    if (this.columnClicked  === 'delete') {
      this.deleteUser(rowData);
    } else if (this.columnClicked === 'edit') {
      this.router.navigate(['/admin/userManagement/update', rowData[0]]);
    } else {
      this.router.navigate(['/admin/userManagement/read', rowData[0]]);
    }
  }

  // keyword search Starts ----------------------------
  onFieldChange(query: string) {
    this.txtQueryChanged.next(query);
  }

  onSearchChange(searchValue: string) {
    this.keyword = (searchValue.length > 1) ? searchValue : '';
    this.model.currentOffset = 0;
    this.filterResults(this.sortField, this.sortOrder);
  }
// keyword search Ends -------------------------------------

// Pagination Code starts  -------------------------------------
  updatePageSize(event) {
    this.model.pageSize = event.value;
    this.model.currentOffset = 0;

    this.filterResults(this.sortField, this.sortOrder);
  }

  nextPage(cls) {
    if (cls === 'next disabled') {
      return false;
    }

    this.model.currentOffset = this.model.currentOffset + 1;
    this.filterResults(this.sortField, this.sortOrder);
  }

  prevPage(cls) {
    if (cls === 'pre disabled') {
      return false;
    }

    this.model.currentOffset = this.model.currentOffset - 1;
    this.filterResults(this.sortField, this.sortOrder);
  }

  // Pagination Code Ends  -------------------------------------


  // Table Filter Options - Start  -------------------------------------

  /**
   * @ngdoc method
   * @name setTableFilterOptions
   * @methodOf healtheNet.ui.component: ViewAllUsersComponent
   * @description
   * Set the filter options of the "data table" in local storage to later use.
   * Coming back to this page after performing other CURD operations and then finding the previous filters saved.
   */
  setTableFilterOptions(viewType) {
    const tableFilterOptions = {
      pageSize: this.model.pageSize,
      currentOffset: this.model.currentOffset,
      searchField: this.keyword,
      sortField: {
        fieldName: this.sortField,
        sortOrder: this.sortOrder
      }
    };
    // Store the filter options in local Storage
    this.utils.setTableFiltersInLocalStorage(viewType, 'user', tableFilterOptions);
  }

  /**
   * @ngdoc method
   * @name setTableFilterOptionsOnInit
   * @methodOf healtheNet.ui.component: ViewAllUsersComponent
   * @description
   * OnInit -Check If table filters are present then implement them on the page
   * Else display the default view
   */
  setTableFilterOptionsOnInit() {
    // Get Table Filters so we can remember the filter information
    const tableFilters = JSON.parse(localStorage.getItem('tableFilters'));
    // if table Filters exist then Store the filterOptions else Store/implement the default filters
    if (tableFilters && Object.keys(tableFilters['user']).length !== 0) {
      this.model.pageSize = tableFilters.user.pageSize;
      this.txtQuery = tableFilters.user.searchField;
      this.model.currentOffset = tableFilters.user.currentOffset;
      this.sortField = tableFilters.user.sortField.fieldName;
      this.sortOrder = tableFilters.user.sortField.sortOrder;

      // Search on table if searchField is present
      if (this.txtQuery) {
        this.onFieldChange(this.txtQuery);
      }
    } else {
      this.setTableFilterOptions('');
    }
  }

  populateDOB(value) {
    if (value !== '' && value !== null) {
      return  moment(value).format('L');
    } else {
    return '. . . . . .';
  }
  }

  polulateStatus(value) {
    if (value !== null && value !== '' && value !== undefined) {
      return value ? 'ACTIVE' : 'INACTIVE';
    } else {
      return '. . . . . .';
    }
  }

  // Table Filter Options - End  -------------------------------------

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
