import {Component, OnInit, ViewEncapsulation, Inject, OnDestroy} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PayerDetailsService } from '@services/index';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-transaction-settings',
    templateUrl: './transaction-settings.component.html',
    styleUrls: ['./transaction-settings.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TransactionSettingsComponent implements OnInit, OnDestroy {
    model: any = {};
    fileName = '';
    fileType = '';
    selectedFile = '';
    fileUploaded = false;
    fileErrorMessage = false;
    fileRequired = false;
    actualFileData;
    onOffConfigs  = [];
    payerId = '';
    styleSheet = '';
    showSheet = false;
    label = 'show Style Sheet';
    showButton = false;
    monthOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    dayOptions = [ '90', '180'];
    isMonthOn = false;
    isDayOn = false;
    private unSubscribe = new Subject();

    constructor(public dialogRef: MatDialogRef<TransactionSettingsComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private payerDetailService: PayerDetailsService) {
        this.model.transaction = data.transactionData;
        this.payerId = data.payerId;
        this.onOffConfigs = this.model.transaction.onOffConfigs;
    }

    ngOnInit() {
        for ( let i = 0 ; i < this.onOffConfigs.length ; i++) {
            if (this.onOffConfigs[i].configName !== 'Member Information Setting' &&
                this.onOffConfigs[i].configName !== 'Provider ID Qualifier' ) {
                this.onOffConfigs[i].isActive  = this.onOffConfigs[i].value === 'ACTIVE';
            } else {
                if (this.onOffConfigs[i].configName === 'Member Information Setting') {
                    this.onOffConfigs[i].isActive = this.onOffConfigs[i].value === 'GENERIC';
                } else if (this.onOffConfigs[i].configName === 'Provider ID Qualifier') {
                    this.onOffConfigs[i].isActive = this.onOffConfigs[i].value === 'TIN';
                }
            }

        }
        const filterMonths = this.onOffConfigs.filter(x => x.configName === 'Months');
        const filterDays = this.onOffConfigs.filter(x => x.configName === 'Days');
        if (filterMonths.length > 0) {
            this.isMonthOn = filterMonths[0].isActive;
            const availableArray = this.onOffConfigs.filter(x => x.configName === 'Available Months');
            if (availableArray.length > 0) {
                if (availableArray[0].value.items !== undefined && availableArray[0].value.items !== null) {
                    this.model.availableMonths = availableArray[0].value.items;
                } else {
                    this.model.availableMonths = availableArray[0].value;
                }
            }

        }
        if (filterDays.length > 0) {
            this.isDayOn = filterDays[0].isActive ;
            const availableDayArray = this.onOffConfigs.filter(x => x.configName === 'Available Days');
            if (availableDayArray.length > 0) {
                this.model.availableDays = availableDayArray[0].value;
            }
        }

        this.payerDetailService.fetchXlsFile(this.payerId, this.model.transaction.permissionId)
            .takeUntil(this.unSubscribe).subscribe(
            data => {
                if (data.displayXslt != null) {
                    this.styleSheet = data.displayXslt;
                    this.showButton = true;
                } else {
                    this.showButton = false;
                }

            },
            error => {
                console.error(error);
            }
        );

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        if (this.fileUploaded || this.model.transaction.displayXslt !== '' ) {
            this.fileRequired = false;
            const newConfigs = [];
            for ( let i = 0 ; i < this.onOffConfigs.length ; i++) {
                if (this.onOffConfigs[i].configName !== 'Available Months' && this.onOffConfigs[i].configName !== 'Available Days') {
                    if (this.onOffConfigs[i].configName !== 'Member Information Setting' &&
                        this.onOffConfigs[i].configName !== 'Provider ID Qualifier') {
                        this.model.transaction.onOffConfigs[i].value  = this.onOffConfigs[i].isActive ? 'ACTIVE'  : 'INACTIVE';
                    } else {
                        if (this.onOffConfigs[i].configName === 'Member Information Setting') {
                            this.model.transaction.onOffConfigs[i].value  = this.onOffConfigs[i].isActive ? 'GENERIC' :
                                'GENERIC_MEMBER_SECTION';
                        } else if (this.onOffConfigs[i].configName === 'Provider ID Qualifier') {
                            this.model.transaction.onOffConfigs[i].value  = this.onOffConfigs[i].isActive ? 'TIN' :  'NPI';
                        }

                    }
                } else {
                    if (this.onOffConfigs[i].configName === 'Available Months') {
                        this.model.transaction.onOffConfigs[i].value = (this.model.availableMonths !== undefined &&
                        this.model.availableMonths !== '') ? this.model.availableMonths : 'EMPTY';

                    } else if (this.onOffConfigs[i].configName === 'Available Days') {
                        this.model.transaction.onOffConfigs[i].value = (this.model.availableDays !== undefined &&
                        this.model.availableDays !== '') ? this.model.availableDays : 'EMPTY';
                    }
                }

                newConfigs.push({configName : this.onOffConfigs[i].configName , value : this.onOffConfigs[i].value});
            }
            this.model.transaction.onOffConfigs = newConfigs;
            this.model.transaction.displayXslt = this.fileUploaded ?  this.actualFileData : this.model.transaction.displayXslt ;
            this.data.updatedTransaction = this.model.transaction;

            this.dialogRef.close(this.data.updatedTransaction);
        } else {
            this.fileRequired = true;
        }

    }

    fileReader(files) {
        const reader = new FileReader();
        const contextualReference = this;

        reader.onload = function (e) {

            contextualReference.actualFileData = reader.result ; // reader.result.split(',')[1]; // get base64 encoded value of PDF document

        };

        if (files[0]) {

            this.fileName = files[0].name;
            this.fileType = files[0].type;
            this.selectedFile = this.fileName;
            const index = this.fileName.toString().lastIndexOf('.');
            const extension = this.fileName.substr(index + 1);

            if (extension === 'xsl' || extension === 'xslt') {
                contextualReference.fileUploaded = true;
                this.fileErrorMessage = false;
                reader.readAsText(files[0]);
            } else {
                this.fileErrorMessage = true;
                contextualReference.fileUploaded = false;

            }
        }
    }

    viewStyleSheet() {
        this.showSheet = !this.showSheet;

        this.label = (this.showSheet) ? 'Hide Style Sheet' : 'Show Style Sheet';
    }


    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }


    updateToggle(config, event) {
        if (config === 'Months') {
            this.isMonthOn = event.checked;
        }
        if (config === 'Days') {
            this.isDayOn = event.checked;
        }
    }

}
