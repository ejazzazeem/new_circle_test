import {Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, OnDestroy, ChangeDetectorRef,
ChangeDetectionStrategy} from '@angular/core';
import { Page, SortFields, DataRequest, PayerResult } from '@models/index';
import { ViewAllPayersService, LoaderService, AlertService, UtilsService} from '@services/index';
import { DataTableDirective } from 'angular-datatables';
import {  MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import 'rxjs/add/observable/of';
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

declare function isIE(): any;
@Component({
  selector: 'app-view-all-payers',
  templateUrl: './view-all-payers.component.html',
  styleUrls: ['./view-all-payers.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewAllPayersComponent implements OnInit, AfterViewInit, OnDestroy  {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<PayerResult> = new Subject();
  model: any = {payerCount: 0, pageSize: 10, currentOffset: 0,  totalPages: 0};

  filteredResults ;
  preClass = 'pre disabled';
  nextClass = 'next';
  sortClasses = {
    name: 'sort-icon', status: 'sort-icon'
  };

  // Sort Field and Sort Order
  sortField = 'name';
  sortOrder = 'ASC';

  keyword = '';
  txtQuery: string;
  txtQueryChanged: Subject<string> = new Subject<string>();
  columnClicked = '';
  private unSubscribe = new Subject();

  constructor(public dialog: MatDialog,
              private router: Router,
              private viewAllPayersService: ViewAllPayersService,
              private loaderService: LoaderService,
              private utils: UtilsService,
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
      pagingType: 'full_numbers',
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No payer record found.'
      },
      columnDefs: [{'targets': [0], 'visible': false}],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          this.readPayerRecord(data);
        });
        return row;
      }
    };

    // If filters are present in local storage then display the filters, else display default view.
    this.setTableFilterOptionsOnInit();

    // if browser is not IE and if searchWord is empty
    if (!isIE() && !this.txtQuery) {
      this.filterResults(this.sortField, this.sortOrder);
    }
  }

  // navigate to read payer Screen to display the record when clicked on a table row.
  readPayerRecord(data) {
    if (this.columnClicked  === 'delete') {
      this.deletePayer(data);
    } else if (this.columnClicked === 'edit') {
      this.router.navigate(['admin/payerManagement/update', data[0]]);
    } else {
      this.router.navigate(['admin/payerManagement/read/', data[0]]);
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /**
   * @ngdoc method
   * @name filterResults
   * @param sortColumn
   * @param sortOrder
   * @methodOf healtheNet.ui.component: ViewAllPayersComponent
   * @description
   * Set the Page Sorting and Pagination Payload to send to the server to
   * retrieve payers accordingly.
   */
  filterResults(sortColumn, sortOrder) {
    this.loaderService.display(false);
    if (sortColumn  !== '') {
      for (const key in this.sortClasses) {
        if (key === sortColumn) {
          this.sortClasses[key] = sortOrder === 'DESC' ? 'sort-icon dec' : 'sort-icon asc';
        } else {
          this.sortClasses[key] = 'sort-icon';
        }
      }
    } else {
      sortColumn = 'name';
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

    const payer: DataRequest = {
      keyword : this.keyword,
      sortField : {page : page , sortField: sortFields}
    };

    this.viewAllPayersService.getAllPayers(payer).takeUntil(this.unSubscribe).subscribe(
        data => {

          this.filteredResults = data.results;
          this.model.payerCount = data.totalCount;
          // Set the filter Options in local storage to be 'remembered' for later.
          this.setTableFilterOptions('payer');

          if (this.model.payerCount > 0) {
            if (this.model.payerCount % this.model.pageSize === 0) {
              this.model.totalPages = this.model.payerCount / this.model.pageSize;
            } else {
              this.model.totalPages = Math.floor(this.model.payerCount / this.model.pageSize) + 1;
            }
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
              console.error('Error getting data table for all payers. ' + error);
          });

        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  /**
   * @ngdoc method
   * @name deletePayer
   * @methodOf healtheNet.ui.component: ViewAllPayersComponent
   * @description
   * Call delete service to delete a payer by payer Id
   */
  deletePayer(data) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete "' + data[1] + '" ?',
        componentName: 'ViewAllGroupsComponent'
      }
    });

    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result === 'yes') {
        this.loaderService.display(true);
        this.viewAllPayersService.deletePayer(data[0]).takeUntil(this.unSubscribe).subscribe(
            responseData => {
              if (responseData.errors === undefined) {
                this.alertService.success('Payer deleted successfully');
                this.filterResults(this.sortField, this.sortOrder);
              }
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

  // keyword search Starts ----------------------------
  onFieldChange (query: string) {
    this.loaderService.display(true);
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
   * @methodOf healtheNet.ui.component: ViewAllPayersComponent
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
    this.utils.setTableFiltersInLocalStorage(viewType, 'payer', tableFilterOptions);
  }

  /**
   * @ngdoc method
   * @name setTableFilterOptionsOnInit
   * @methodOf healtheNet.ui.component: ViewAllPayersComponent
   * @description
   * OnInit -Check If table filters are present then implement them on the page
   * Else display the default view
   */
  setTableFilterOptionsOnInit() {
    // Get Table Filters so we can remember the filter information
    const tableFilters = JSON.parse(localStorage.getItem('tableFilters'));
    // if table Filters exist then Store the filterOptions else Store/implement the default filters
    if (tableFilters && Object.keys(tableFilters['payer']).length !== 0) {
      this.model.pageSize = tableFilters.payer.pageSize;
      this.txtQuery = tableFilters.payer.searchField;
      this.model.currentOffset = tableFilters.payer.currentOffset;
      this.sortField = tableFilters.payer.sortField.fieldName;
      this.sortOrder = tableFilters.payer.sortField.sortOrder;

      // Search on table if searchField is present
      if (this.txtQuery) {
        this.onFieldChange(this.txtQuery);
      }
    } else {
      this.setTableFilterOptions('');
    }
  }

  // Table Filter Options - End  -------------------------------------

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}



