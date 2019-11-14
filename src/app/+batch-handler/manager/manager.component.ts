import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { BatchHandlerService, AlertService, LoaderService } from '@services/index';
import {  MatDialog } from '@angular/material';
import { ConfirmDialogComponent, BATCH_STATUS, USER_ROLES } from '@misc/index';
import { saveAs } from 'file-saver/FileSaver';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {CurrentUserService} from '../../services/auth/current-user.service';
import * as moment from 'moment';
declare function isIE(): any;
@Component({
  selector: 'app-batch-manager',
  templateUrl: 'manager.component.html',
  styleUrls: ['manager.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ManagerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  model: any = {};
  batchList: any;
  userGroup: string;
  batchStatus = BATCH_STATUS;
  batchFile: any;
  fileName = '';
  batchInfo: boolean;
  currentUser: any;
  userRole = USER_ROLES;
  private unSubscribe = new Subject();

  constructor(private batchHandlerService: BatchHandlerService,
              private currentUserService: CurrentUserService,
              private alertService: AlertService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.dtOptions = {
      scrollY: '380px',
      scrollCollapse: true,
      searching: false,
      info: false,
      lengthChange: false,
      ordering: true,
      paging: false,
      order: [5, 'desc'],
      language: {
        emptyTable: 'No Record Found'
      },
      columnDefs: [
        {
          'targets': [0, 1, 2, 3, 4, 6, 7, 8, 9 , 10, 11],
          'orderable': false,
        },
      ],
    };

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.currentUser = JSON.parse(currentUser);
    } else {
      this.currentUserService.getCurrentUser().then(user => {
        if (user) {
          this.currentUser = user;
        } else {
          console.error('Error getting current user while initializing side menu for reporting');
        }
      }).catch(error => {
        console.error('Error getting current user while initializing side menu for reporting: ' + error);
      });
    }

    // First time Populate the table
    this.retrieveBatchList();

    Observable.interval(60000).takeUntil(this.unSubscribe).subscribe(x => {
      // Fetch previous batch list to be displayed
      this.retrieveBatchList();
    });
  }

  ngAfterViewInit(): void {
      this.dtTrigger.next();
  }

  convertDateTime(batchDate) {
    return batchDate ? moment(batchDate).format('MM/DD/YYYY, h:mm a') : '. . . . . . .';
  }

  /**
   * @ngdoc method
   * @name retrieveBatchList
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @description
   * Fetch the batch list of the selected group to be displayed on screen
   */
  retrieveBatchList() {
    this.userGroup = this.currentUser.userGroups[0] ? this.currentUser.userGroups[0].groupId : null;
    const batchId = '';

    // Loads Batch List
   this.batchHandlerService.retrieveBatchList(this.userGroup, batchId)
        .takeUntil(this.unSubscribe).subscribe(
        data => {
          this.batchList = data;

            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              // Destroy the table first
              dtInstance.destroy();
              // Call the dtTrigger to re-render again
              this.dtTrigger.next();
            }).catch(error => {
              console.error('Error getting batch list for the table... ' + error);
            });
        }, error => {
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  /**
   * @ngdoc method
   * @name populateBatchStatus
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @param status
   * @description
   * populate the batch status in the table
   */
  populateBatchStatus(status) {
    switch (status) {
      case 'NEW':
        return this.batchStatus.NEW;
      case 'PENDING':
        return this.batchStatus.PENDING;
      case 'RUNNING':
        return this.batchStatus.RUNNING;
      case 'FAILED':
        return this.batchStatus.FAILED;
      case 'ASSEMBLED':
        return this.batchStatus.ASSEMBLED;
      case 'MARKED_FOR_DELETION':
        return this.batchStatus.MARKED_FOR_DELETION;
      default:
        return '. . . . . . .';
    }
  }

  /**
   * @ngdoc method
   * @name deleteSingleBatch
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @param batchId
   * @description
   * Call delete service to delete a batch by batch Id
   */
  deleteBatch(batchId) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete?',
        componentName: 'ManagerComponent'
      }
    });

    dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
      if (result === 'yes') {
        this.batchHandlerService.deleteBatchByBatchId(batchId, this.userGroup)
            .takeUntil(this.unSubscribe).subscribe(
            response => {
              this.alertService.success(response.message);

              // reload the batch list table to display updated records
              setTimeout(() => {
               this.retrieveBatchList();
              }, 1000);
            },
            error => {
              this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
      }
    });
  }

  /**
   * @ngdoc method
   * @name downloadBatch
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @param batchId
   * @param fileType
   * @description
   * Get the information for the specific batch and then download the batch file
   */
  downloadBatch(batchId, fileType) {
    this.batchHandlerService.getBatchByBatchId(batchId, this.userGroup, fileType)
        .takeUntil(this.unSubscribe).subscribe(
        response => {
          // create a text file blob and save it on the client's computer
           const blob = new Blob([response], {type: 'text/plain;charset=utf-8'});
           FileSaver.saveAs(blob, fileType + 'Batch.txt');
        },
        error => {

          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  /**
   * @ngdoc method
   * @name readBatchFile
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @param files
   * @description
   * Read the the browsed batch file
   */
  readBatchFile(files) {
    const reader = new FileReader();
    const contextualReference = this;
    reader.onload = function (e) {
      contextualReference.batchFile = reader.result;
    };
    if (files[0]) {
      this.fileName = files[0].name;
      this.batchFile = reader.readAsText(files[0]);

    }
  }

  /**
   * @ngdoc method
   * @name uploadBatchFile
   * @methodOf healtheNet.ui.component: ManagerComponent
   * @description
   * Upload batch file as a multipart and reload table after successful file submission
   */
  uploadBatchFile() {
    const FD = new FormData();
    FD.append('file', this.batchFile);
    FD.append('usergroup', this.userGroup);
    this.batchHandlerService.submitBatchFile(FD, isIE())
        .takeUntil(this.unSubscribe).subscribe(
        response => {
          if (response.batchId) {
            this.alertService.success('Batch Submitted Successfully');
            setTimeout(() => {
              this.retrieveBatchList();
            }, 1000);
          } else {
            this.alertService.success('Error');
          }
        },
        error => {
          this.alertService.error(error.error.errors[0].endUserMessage);
        }
    );
  }

  // unSubscribe the observables to avoid memory leaks
  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
