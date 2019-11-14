import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ConfirmDialogComponent} from '../../confirm-dialog/confirm-dialog.component';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs/Rx';
import {MatDialog} from '@angular/material';
import {GetGroupsService, AlertService, LoaderService} from '@services/index';
import { Page, SortFields, DataRequest } from '@models/index';
import {AssociateTaxIdDialogComponent} from '../associate-tax-id-dialog/associate-tax-id-dialog.component';

@Component({
  selector: 'app-associated-tax-id',
  templateUrl: 'associated-tax-id.component.html',
  styleUrls: ['associated-tax-id.component.scss']
})
export class AssociatedTaxIdComponent implements OnInit, OnDestroy {
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  @Input() groupID;
  @Input() showRecords;
  @Input() selectedTaxID;
  @Input() titleName;
  dtOptions_groupTaxID: DataTables.Settings = {};
  dtOptions_taxIDPerson: DataTables.Settings = {};

  dtTriggerTaxIds: Subject<any> = new Subject();
  dtTriggerPersons: Subject<any> = new Subject();

  filterProviders;
  selectedPersons: any = [];
  totalProviders = 0;

  // server side pagination for Tax ID
  taxID_pageSize = 10;
  taxID_currentOffset = 0;
  taxID_preClass = 'pre disabled';
  taxID_nextClass = 'next';
  taxID_totalPages = 0;

  // server side pagination for providers of tax id
  pageSize = 10;
  currentOffset = 0;
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  totalRecords = 0;

  hideTable = true;
  private unSubscribe = new Subject();
  constructor(private getGroupsService: GetGroupsService,
              public dialog: MatDialog,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.loaderService.display(true);
    this.dtOptions_groupTaxID = {
      pagingType: 'full_numbers',
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No Tax ID is associated with this group yet'
      }
    };
      this.getGroupTaxDetails();

  }

  addTaxId() {
    const dialogRef = this.dialog.open(AssociateTaxIdDialogComponent, {
      data: {

      }
    });

    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result !== '' && result !== undefined && result !== null) {
        this.getGroupsService.associateTaxId(this.groupID, result).takeUntil(this.unSubscribe).subscribe(
            data => {
              this.alertService.success('Tax ID Associated.');
              setTimeout(() => { this.loadContents(); }, 3000);
            },
            error => {
              this.alertService.error(error.error.errors[0].endUserMessage);

            }
        );
      }
    });
  }

  selectTaxIDs(data) {
    this.showRecords = true;
    this.totalPages = 0;
    this.currentOffset = 0;
    this.selectedTaxID = data.taxId;
    this.hideTable = false;
    this.filterResults();
  }

  // Pagination Code starts  -------------------------------------
  taxIDupdatePageSize(event) {
    this.taxID_pageSize = event.value;
    this.taxID_currentOffset = 0;
    this.selectedTaxID = '';
    this.hideTable = true;
    this.getGroupTaxDetails();
  }

  taxIDnextPage(cls) {
    if (cls === 'next disabled') {
      return false;
    }

    this.taxID_currentOffset = this.taxID_currentOffset + 1;
    this.getGroupTaxDetails();
  }

  taxIDprevPage(cls) {
    if (cls === 'pre disabled') {
      return false;
    }

    this.taxID_currentOffset = this.taxID_currentOffset - 1;
    this.getGroupTaxDetails();
  }

  // Pagination Code Ends  -------------------------------------

  getGroupTaxDetails() {
    this.loaderService.display(true);
    const groupRequest: DataRequest = {
      keyword : '',
      sortField : {
        page : {
          offSet : this.taxID_currentOffset,
          size : this.taxID_pageSize
        },
        sortField: {
          fieldName: '',
          sortOrder:  'ASC'
        }
      }
    };
    this.getGroupsService.getGroupProviders(this.groupID, groupRequest)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.totalProviders = data.totalCount;
          this.filterProviders = data.results;

          this.cdr.detectChanges();
          this.selectedPersons = [];


          if (this.totalProviders % this.taxID_pageSize === 0 ) {
            this.taxID_totalPages = this.totalProviders / this.taxID_pageSize ;
          } else {
            this.taxID_totalPages = Math.floor( this.totalProviders / this.taxID_pageSize) + 1;
          }

          this.taxID_nextClass =
              ((this.taxID_totalPages === (this.taxID_currentOffset + 1)) || this.totalProviders === 0) ? 'next disabled' : 'next';
          this.taxID_preClass = (this.taxID_currentOffset === 0) ? 'pre disabled' : 'pre';

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



  deleteTaxId(id) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove the Association between this group and Tax ID ?',
        componentName: 'ViewAllGroupsComponent'
      }
    });

    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result === 'yes') {
        this.getGroupsService.removeAssociatedTaxId(this.groupID, id).takeUntil(this.unSubscribe).subscribe(
            data => {
              this.showRecords = false;
              this.alertService.success('Tax ID association removed.');
              this.taxID_currentOffset = 0;
              setTimeout(() => { this.loadContents(); }, 2000);
            },
            error => {
              this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
      }
    });
  }

  loadContents() {
    this.loaderService.display(true);
      this.selectedTaxID = '';
      this.getGroupTaxDetails();
  }

  // Selected Tax ID Table Code ***********************************************************************
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
  // Pagination Code Ends  -------------------------------------

  filterResults() {
    this.loaderService.display(true);

    const sortFields: SortFields  = {
      fieldName: '',
      sortOrder: 'ASC'
    };
    const page: Page = {
      offSet : this.currentOffset,
      size : this.pageSize
    };
    const groupRequest: DataRequest = {
      keyword : '',
      sortField : {
        page : page,
        sortField: sortFields
      }
    };

    this.getGroupsService.getTaxIDDetails(this.selectedTaxID,  groupRequest).takeUntil(this.unSubscribe).subscribe(
        data => {
          this.selectedPersons = data.results;
          this.totalRecords =  data.totalCount;
          this.cdr.detectChanges();
          if ( this.totalRecords % this.pageSize === 0 ) {
            this.totalPages =  this.totalRecords / this.pageSize ;
          } else {
            this.totalPages = Math.floor(  this.totalRecords / this.pageSize) + 1;
          }

          this.nextClass =
              ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
          this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';

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
  // Selected Tax ID Table Code ***********************************************************************

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
