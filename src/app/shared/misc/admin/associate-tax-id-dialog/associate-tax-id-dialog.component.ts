import {
  Component, OnInit, ViewEncapsulation, Inject, ViewChildren, QueryList, AfterViewInit,
  OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Page, SortFields, DataRequest } from '@models/index';
import { GetGroupsService, LoaderService, AlertService } from '@services/index';

@Component({
  selector: 'app-associate-tax-id',
  templateUrl: './associate-tax-id-dialog.component.html',
  styleUrls: ['./associate-tax-id-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class AssociateTaxIdDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtOptions_Summary: DataTables.Settings = {};
  dtOptions_Person: DataTables.Settings = {};
  dtTriggerSummary: Subject<any> = new Subject();
  dtTriggerPerson: Subject<any> = new Subject();
  taxID = '';
  searched = false;
  filterProviders;
  showMessage = false;

// server side pagination
  pageSize = 100;
  currentOffset = 0;
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  totalRecords = 0;
  selectedPersons: any = [];
  private unSubscribe = new Subject();

  constructor(public dialogRef: MatDialogRef<AssociateTaxIdDialogComponent>,
              private getGroupsService: GetGroupsService,
              private loaderService: LoaderService,
              private alertService: AlertService,
              private cdr: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.dtOptions_Summary = {
      pagingType: 'full_numbers',
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No Tax ID found'

      }
    };
    this.dtOptions_Person = {
      scrollY: '140px',
      scrollCollapse: true,
      pagingType: 'full_numbers',
      searching: false,
      info: false,
      lengthChange: false,
      ordering: false,
      paging: false,
      language: {
        emptyTable: 'No Tax ID found'

      }
    };

  }
  ngAfterViewInit(): void {
    this.dtTriggerSummary.next();
    this.dtTriggerPerson.next();
  }


  lookUpByTaxId() {
    if (this.taxID !== '') {
      this.searched = true;
      this.showMessage = false;
      this.currentOffset = 0;
      this.filterResults();
    } else {
      this.showMessage = true;
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close(this.taxID);
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

    this.getGroupsService.getTaxIDDetails(this.taxID,  groupRequest).takeUntil(this.unSubscribe)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.cdr.detectChanges();
          if (data.totalCount > 0) {
            this.searched = true;
            this.showMessage = false;
            const obj: any = {};
            obj.taxId = this.taxID;
            obj.providerPersonCount = data.totalCount;
            this.filterProviders = obj;
            this.selectedPersons = data.results;
            console.log(this.selectedPersons);
            this.totalRecords =  data.totalCount;
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
          } else {
            this.searched = true;
            this.showMessage = true;
            this.filterProviders = null;

          }
          this.loaderService.display(false);
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );

  }
  validate(event) {
    if (event.target.value === '') {
      this.searched = false;
      this.showMessage = false;
      this.filterProviders = null;

    }
  }

  // Pagination Code Ends  -------------------------------------

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
