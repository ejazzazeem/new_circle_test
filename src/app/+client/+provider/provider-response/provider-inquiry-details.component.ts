/**
 * Created by Mehwish on 4/3/2018.
 */
import { Component, OnInit, ViewEncapsulation, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, LoaderService, ProviderService, DataSharingService } from '@services/index';
import { Subject } from 'rxjs/Subject';
import { saveAs } from 'file-saver/FileSaver';
import * as FileSaver from 'file-saver';
import { RequestOptions, ResponseContentType } from '@angular/http';


@Component({
    selector: 'app-provider-inquiry-details',
    templateUrl: './provider-inquiry-details.component.html',
    styleUrls: ['./provider-inquiry-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProviderInquiryDetailsComponent implements OnInit, OnDestroy {
    providerData: any;
    claimInformation: any;
    patientInformation: any;
    inquiryId: any;
    inquiryStatus: any;
    dateSent: any;
    getFormData: any;
    model: any = {
        inquiryInformation: {},
    };
    providerRequestMessage: any;
    payerResponseMessage: any;
    atachments: any;
    goOnTop = false;
    selectedTab: 1;
    payerMessage: any;
    attachments: any;
    inquiryType: any = [];
    user: any;
    payerInformation: any;
    private unSubscribe = new Subject();

    constructor(
        private alertService: AlertService,
        private loaderService: LoaderService,
        private dataSharingService: DataSharingService,
        private providerService: ProviderService,
        private router: Router,
        private cdr: ChangeDetectorRef) {
    }
    ngOnInit() {
        this.loaderService.display(true);

        this.dataSharingService.getSingleResponseDetail.takeUntil(this.unSubscribe).subscribe(
            data => {
                if (Object.keys(data).length === 0) {
                    this.router.navigate(['/client/provider-inquiry/status']);
                } else {
                    const response = data[0];
                    // this.cdr.detectChanges();
                    this.providerData = response.provider;
                    this.claimInformation = response.claim;
                    this.patientInformation = response.patient;
                    this.payerMessage = response.message;
                    // this.inquiryInformation = response.acknowledgment;
                    this.model.inquiryInformation.inquiryId = response.inquiryId;
                    this.model.inquiryInformation.inquiryStatus = response.inquiryStatus;
                    this.model.inquiryInformation.dateSent = response.dateSent;
                    this.model.inquiryInformation.inquiryType = response.inquiryType;
                    this.providerRequestMessage = response.providerRequestMessage;
                    this.payerResponseMessage = response.payerResponseMessage;
                    this.attachments = response.attachments;
                    this.user = response.user;
                    this.showHideBackToTopButton(false, 1);
                }
              this.loaderService.display(false);
            },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });

        this.dataSharingService.getFormDataFromInquiryForm
            .takeUntil(this.unSubscribe).subscribe(
            data => {

                if (Object.keys(data).length > 0) {
                    this.getFormData = data;
                    this.payerInformation = this.getFormData.payer;
                } else {
                    const d = localStorage.getItem('providerData');
                    localStorage.removeItem('providerData');
                    this.getFormData = JSON.parse(d);
                     this.payerInformation = this.getFormData.payer;
                }

            }, error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
    }
    showHideBackToTopButton(value, selectedTabIndex) {
        if (value === 'true') {
            this.goOnTop = false;
        } else if (value === 'false') {
            this.goOnTop = true;
        }
        this.selectedTab = selectedTabIndex;
    }

    /**
     * @ngdoc method
     * @name base64ToFile
     * @methodOf healtheNet.ui.component: ProviderInquiryDetailsComponent
     * @description
     * Get file name, content type, file size and file data/stream.
     * create a file from blob stream.
     */
    base64ToFile(file, fileName, contentType, fileSize) {
        contentType = contentType || '';
        const sliceSize = fileSize;
        const byteCharacters = atob(file);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new File(byteArrays, fileName, {type: contentType});
    }

    toBloB(file, contentType) {
        const byteString = atob(file);
        const ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: contentType});
        return blob;

}

    /**
     * @ngdoc method
     * @name viewAttachment
     * @methodOf healtheNet.ui.component: ProviderInquiryDetailsComponent
     * @description
     * Get attachment data against attachmentId and download as a file.
     */

    viewAttachment(attachmentId) {
        this.loaderService.display(true);
        const obj = {
         'payer': {
         'payerId': this.payerInformation.payerId,
          'name': this.payerInformation.name
            },
            attachmentId: attachmentId
        };
        this.providerService.getAttachment(obj).takeUntil(this.unSubscribe).subscribe(
            data => {
                const response = data;
                if (data.file !== null) {
                    // const myFile = this.base64ToFile(response.file, response.fileName, response.fileContentType, response.fileSize);
                    const myFile = this.toBloB(response.file,  response.fileContentType);
                    FileSaver.saveAs(myFile, response.fileName);
                    this.loaderService.display(false);
                } else {
                    this.loaderService.display(false);
                    this.alertService.error('Attachment not found');
                }
                },
            error => {
                this.loaderService.display(false);
                this.alertService.error(error.error.errors[0].endUserMessage);
            });
}
    // unSubscribe the observables to avoid memory leaks
    ngOnDestroy(): void {
        this.unSubscribe.next();
        this.unSubscribe.complete();
    }

}

