import {Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, OnDestroy,
    ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { GroupListService, LoaderService, AlertService, DeleteGroupService, UtilsService } from '@services/index';
import {  MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import 'rxjs/add/observable/of';
import { Subject } from 'rxjs/Subject';
import { DataRequest, Page, SortFields } from '@models/index';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

declare function isIE(): any;
@Component({
    selector: 'app-view-all-groups',
    templateUrl: './view-all-groups.component.html',
    styleUrls: ['./view-all-groups.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})

export class ViewAllGroupsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;

    model: any = {
        groupCount: 0,
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
        name: 'sort-icon',
    };

    // Sort Field and Sort Order
    sortField = 'name';
    sortOrder = 'ASC';

    columnClicked: string;
    keyword = '';
    txtQuery: string;
    txtQueryChanged: Subject<string> = new Subject<string>();
    private unSubscribe = new Subject();

    constructor(private groupListService: GroupListService,
                public dialog: MatDialog,
                private router: Router,
                private alertService: AlertService,
                private loaderService: LoaderService,
                private utils: UtilsService,
                private deleteGroupService: DeleteGroupService,
                private cdr: ChangeDetectorRef) {

        // debounce
        this.txtQueryChanged
            .debounceTime(1000) // wait 1 sec after the last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .takeUntil(this.unSubscribe).subscribe(model => {
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
                emptyTable: 'No Group Found'
            },
            columnDefs: [{'targets': [0], 'visible': false}],
            rowCallback: (row: Node, data: any[] | Object) => {
                // Unbind first in order to avoid any duplicate handler
                // (see https://github.com/l-lin/angular-datatables/issues/87)
                $('td', row).unbind('click');
                $('td', row).bind('click', () => {
                    this.readGroupRecord(data);
                });
                return row;
            }
        };

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
     * @methodOf healtheNet.ui.component: ViewAllGroupsComponent
     * @description
     * Set the Page Sorting and Pagination Payload to send to the server to
     * retrieve groups accordingly.
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
        const groupRequest: DataRequest = {
            keyword : this.keyword,
            sortField : {
                page : page,
                sortField: sortFields
            }
        };

        // Loads Group Details
        this.groupListService.getAllGroups(groupRequest).takeUntil(this.unSubscribe).subscribe(
            data => {
                this.filteredResults = data.results;
                this.model.groupCount = data.totalCount;
                // this.cdr.detectChanges();
                this.filteredResults.splice(this.model.pageSize);

                if (this.model.groupCount % this.model.pageSize === 0) {
                    this.model.totalPages = this.model.groupCount / this.model.pageSize;
                } else {
                    this.model.totalPages = Math.floor(this.model.groupCount / this.model.pageSize) + 1;
                }
                if (this.filteredResults) {
                    for (const i in this.filteredResults) {
                        if (this.filteredResults[i].taxIds.length > 3) {
                            this.filteredResults[i].taxIds = this.filteredResults[i].taxIds.slice(0, 3);
                            this.filteredResults[i].taxIds.push(' ...');
                        }
                    }
                }

                // Set the filter Options in local storage to be 'remembered' for later.
                this.setTableFilterOptions('group');

                this.nextClass =
                    ((this.model.totalPages === (this.model.currentOffset + 1)) || this.model.totalPages === 0) ? 'next disabled' : 'next';
                this.preClass = (this.model.currentOffset === 0) ? 'pre disabled' : 'pre';

                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    // Destroy the table first
                    dtInstance.destroy();
                    // Call the dtTrigger to rerender again
                    this.dtTrigger.next();
                    this.loaderService.display(false);
                }). catch(error => {
                    this.loaderService.display(false);
                    console.error('Error getting data table for view all groups: ' + error);
                });
            },
            error => {
                this.loaderService.display(false);
               this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }

    // navigate to read group Screen to display the record when clicked on a table row.
    readGroupRecord(groupData) {

        if (this.columnClicked === 'delete') {
            this.deleteGroup(groupData);
        } else if (this.columnClicked === 'edit') {
            this.router.navigate(['admin/groupManagement/update/', groupData[0]]);
        } else {
            this.router.navigate(['admin/groupManagement/read', groupData[0]]);
        }
    }

    /**
     * @ngdoc method
     * @name deleteGroup
     * @methodOf healtheNet.ui.component: ViewAllGroupsComponent
     * @param singleGroup
     * @description
     * Call delete service to delete a group by group Id
     */
    deleteGroup(singleGroup) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete "' + singleGroup[1] + '" ?',
                componentName: 'ViewAllGroupsComponent'
            }
        });

        dialogRef.afterClosed().takeUntil(this.unSubscribe).subscribe(result => {
            if (result === 'yes') {

                this.deleteGroupService.deleteGroup(singleGroup[0]).takeUntil(this.unSubscribe).subscribe(
                    responseData => {
                        this.alertService.success('Group Successfully Deleted.');
                        setTimeout(() => {
                            this.filterResults(this.sortField, this.sortOrder);
                        }, 1000);
                    },
                    error => {
                        this.alertService.error(error.error.errors[0].endUserMessage);
                    }
                );
            }
            this.columnClicked = '';
        });
    }

    // keyword search Starts ----------------------------
    onFieldChange(query: string) {
        this.txtQueryChanged.next(query);
    }

    onSearchChange(searchValue: string) {
        this.loaderService.display(true);
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

    populateAdmins(data) {
        let result = '';
        if (data.length > 3) {
            data = data.slice(0, 3);
            data.forEach(obj => {
                result = (result === '') ? obj.lastName + ' ' + obj.firstName : result  + ', ' + obj.lastName + ' ' + obj.firstName;
            });
            return result + ', ...';
        } else {
            data.forEach(obj => {
                result = (result === '') ? obj.lastName + ' ' + obj.firstName : result + ', ' + obj.lastName + ' ' + obj.firstName;
            });
            return (result === '') ? '. . . . . .' : result;
        }
    }

    populateAdminContacts(data) {
        let result = [];
        let emails = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i].email != null) {
                emails = (emails === '')  ? data[i].email : emails  + ', ' + data[i].email;
                result = emails.split(',');
            }
        }
        if (result.length > 3) {
            result = result.splice(0, 3);
            return result + ', ...';
        } else {
            return (result === []) ? '. . . . . .' : result;
        }
    }


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
        this.utils.setTableFiltersInLocalStorage(viewType, 'group', tableFilterOptions);
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
        if (tableFilters && Object.keys(tableFilters['group']).length !== 0) {
            this.model.pageSize = tableFilters.group.pageSize;
            this.txtQuery = tableFilters.group.searchField;
            this.model.currentOffset = tableFilters.group.currentOffset;
            this.sortField = tableFilters.group.sortField.fieldName;
            this.sortOrder = tableFilters.group.sortField.sortOrder;

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
