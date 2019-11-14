import {Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';

import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '@misc/confirm-dialog/confirm-dialog.component';
import { AddPayerService, AlertService, LoaderService } from '@services/index';
import { AuthenticationType, TransportType, Connectivity } from '@models/index';
import { PayerApiBuilder } from '../../../api-builder/admin/index';

import { ActivatedRoute, Router } from '@angular/router';
import {isNullOrUndefined} from 'util';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-add-payer',
    templateUrl: './add-payer.component.html',
    styleUrls: ['./add-payer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class AddPayerComponent implements OnInit, OnDestroy {
    // Type Assertion
    model: any = {};

    payerTransportType: TransportType = [] as TransportType;
    authenticationType: AuthenticationType = [] as AuthenticationType;
    regionType = [];
    selectedRegions = [];
    connectivity: Connectivity;
    showCertificateAuthentication: boolean;
    checkboxArray: any = [];
    endPointPattern: any;
    ipPattern: any;
    validPattern: boolean;
    fileUploaded = true;
    fileName: string;
    fileType: string;
    selectedFile: string;
    fileErrorMessage = false;
    actualFileData: any;
    payerId: string;
    title: string;
    btnText: string;
    username_validation = false;
    password_validation = false;
    file_validation = false;
    checkboxRequired = true;
    uniquePayerName = true;
    uniquePayerMessage: string;
    editedPayerName: string;
    originalName = '';
    private unSubscribe = new Subject();

    constructor( private addPayerService: AddPayerService,
                 private alertService: AlertService,
                 public dialog: MatDialog,
                 private route: ActivatedRoute,
                 private router: Router,
                 private loaderService: LoaderService,
                 private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loaderService.display(true);

        this.payerId = this.route.snapshot.paramMap.get('id');
        // Loads Payer Transport Type Drop Down
        this.getPayerTransportList();
        if (this.payerId !== '' && this.payerId !== null) {
            // Edit Mode Starts
            this.title = 'Edit Payer';
            this.btnText = 'Update Payer';
            this.addPayerService.getPayerDetail(this.payerId).takeUntil(this.unSubscribe).subscribe(
                data => {
                    // Loads Region Type List
                    this.getPayerRegionList(this.payerId);
                    // this.model = data;
                    this.cdr.detectChanges();
                    this.model.name = data.name;
                    this.originalName = data.name;
                    this.editedPayerName = data.name;
                    this.model.description = data.description;
                    this.model.status = data.status === 'ACTIVE';
                    this.model.transportType = data.connectivity.transportType;
                    //  this.model.method = data.connectivity.auth.method;
                    // if (data.connectivity.auth.method === 'USERNAME_PASSWORD') {
                    //   this.showCertificateAuthentication = true;
                    this.model.username = data.connectivity.username;
                    this.model.password = data.connectivity.password;
                    // } else {
                    //     this.showCertificateAuthentication = false;
                    //     this.fileName = data.connectivity.auth.certificateName;
                    //     this.model.certificate = data.connectivity.auth.certificate;
                    //     this.fileUploaded = true; // only for edit to enable/disable update button condition
                    // }

                    this.selectedRegions = data.regions;

                    /*for (let i = 0; i < this.regionType.length; i++) {
                     if (this.inSelectedRegions(this.regionType[i].regionId.toString())) {
                     this.regionType[i].checked = true;
                     this.checkboxRequired = false;
                     }
                     }*/

                    this.model.endPoint = data.connectivity.endPoint;
                    this.model.coreSenderId = data.coreSenderId;
                    this.model.payerIdCode = data.payerIdCode;
                    this.model.receiverCode = data.receiverCode;
                    this.checkEndpointValidation(this.model.endPoint); // only for edit to enable/disable update button condition

                    this.loaderService.display(false);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);

                });

        } else {
            // Add Mode Starts
            // Loads Region Type List
            this.getPayerRegionList('');
            this.title = 'Add New Payer';
            this.btnText = 'Save Payer';
            this.model.status = true; // set active by default
            this.loaderService.display(false);

        }// Add Ends



    }

    inSelectedRegions(regionId) {

        let result = false;
        for ( let i = 0; i < this.selectedRegions.length; i++ ) {
            if (this.selectedRegions[i].toString() === regionId) {
                this.checkboxArray.push(
                    regionId
                );
                result = true;
                break;
            }
        }
        return result;
    }

    getPayerRegionList(editPayerId) {

        // Loads Region Type List
        this.addPayerService.getPayerRegionList().takeUntil(this.unSubscribe).subscribe(
            data => {
                // this.regionType = data;
                for ( let i = 0; i < data.length; i++) {
                    this.regionType.push({regionId: data[i].regionId , name: data[i].name, checked: false });
                }

                if (editPayerId) {

                    for (let i = 0; i < this.regionType.length; i++) {
                        if (this.inSelectedRegions(this.regionType[i].regionId.toString())) {
                            this.regionType[i].checked = true;
                            this.checkboxRequired = false;
                        }
                    }
                }
            },
            error => {
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    checkPayerNameAvailability(payerName) {

        if ((payerName !== undefined || payerName !== '') && (payerName !== this.editedPayerName) && (payerName !== this.originalName)) {

            if (payerName.trim().length > 0) {

                this.addPayerService.checkPayerUniqueness(payerName).takeUntil(this.unSubscribe).subscribe(
                    data => {
                        if (data.message.indexOf('already in use by another Payer') === -1) {
                            this.uniquePayerName = true;
                            this.uniquePayerMessage = data.message;
                        } else {
                            this.uniquePayerName = false;
                            this.uniquePayerMessage = data.message;
                        }
                    },
                    error => {

                        this.uniquePayerName = false;
                        this.uniquePayerMessage = error.error.errors[0].endUserMessage;

                    });
            }

        } else {
            this.uniquePayerName = true;
            this.uniquePayerMessage = '';
        }
    }

    /* To Handle Endpoint Field Pattern Validation */
    checkEndpointValidation(inputString) {

        const endpointString = isNullOrUndefined(inputString);

        if ((endpointString !== true) && (inputString.trim().length > 0 || inputString !== '')) {
            this.endPointPattern =
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
            this.ipPattern = '^([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})$';
            this.validPattern = inputString.match(this.endPointPattern) || inputString.match(this.ipPattern);
        } else {
            this.validPattern = true;
        }

    }
    getPayerTransportList() {
        // Loads Payer Transport Type Drop Down
        this.addPayerService.getPayerTransportList().takeUntil(this.unSubscribe).subscribe(
            data => {
                this.payerTransportType = data;
            },
            error => {
                this.alertService.error(error.error.errors[0].endUserMessage);
            }
        );
    }

    cancelForm(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Cancel',
                message: 'Are you sure you want to cancel ?',
                componentName: 'AddPayerComponent'
            }
        });

    }
    /* To Handle Multiple CheckBoxes */
    getValues(selectedValue) {

        if (selectedValue.checked === true) {
            this.checkboxArray.push(
                selectedValue.regionId
            );
        } else {
            const selectedIndex = this.checkboxArray.indexOf(selectedValue.regionId);
            // const selectedIndex = this.checkboxArray.findIndex(x =>
            // x.id === selectedValue.regionId); // get selected index based on value
            this.checkboxArray.splice(selectedIndex, 1);
        }
        this.checkboxRequired = !(this.checkboxArray.length >= 1);
        // this.model.regions = this.checkboxArray; // assigning selected checkboxes array to regions model
    }
    fileReader(files) {
        const reader = new FileReader();
        const contextualReference = this;
        reader.onload = function (e) {
            contextualReference.actualFileData = reader.result.split(',')[1]; // get base64 encoded value of PDF document
        };
        if (files[0]) {
            this.fileName = files[0].name;
            this.fileType = files[0].type;
            this.selectedFile = this.fileName;
            if (this.fileType !== 'application/pdf') {
                contextualReference.fileUploaded = false;
                this.fileErrorMessage = true;
            } else {
                this.fileErrorMessage = false;
                contextualReference.fileUploaded = true;
                reader.readAsDataURL(files[0]);
                this.file_validation = false;
            }
        }
    }

    validatePayerForm() {

        // check if user name and password fields are present in form then check for their validation
        if (this.model.transportType === 'SOAP_WSDL') {
            if (this.model.username === undefined || this.model.username === '' ||
                this.model.password === undefined || this.model.password === '') {
                return true;
            }
        }


        if (this.model.name === undefined || this.model.name === '' ||
            this.model.endPoint === undefined || this.model.endPoint === '') {
            return true;
        } else {
            return !(this.model.name.trim().length > 0 && this.model.endPoint.trim().length > 0);
        }


    }

    savePayer(payerData) {
        this.loaderService.display(true);
        payerData.regions = this.checkboxArray;
        payerData.status = PayerApiBuilder.buildStatus(payerData.status);
        payerData = PayerApiBuilder.buildDescription(payerData);

        if (this.payerId !== '' && this.payerId !== null) {
            // Update code
            payerData.payerId = this.payerId;

            this.addPayerService.updatePayer(payerData, this.payerId).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.loaderService.display(false);
                    this.router.navigate(['admin/payerManagement/read/' + data.payerId]);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                });

        } else {
            // Add Code
            payerData.payerId = '';

            this.addPayerService.addPayer(payerData).takeUntil(this.unSubscribe).subscribe(
                data => {
                    this.loaderService.display(false);
                    this.router.navigate(['admin/payerManagement/read/' + data.payerId]);
                },
                error => {
                    this.loaderService.display(false);
                    this.alertService.error(error.error.errors[0].endUserMessage);
                }
            );

        }
    }

    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }
}


