import { Component, OnInit, ViewEncapsulation, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { DataSharingService } from '@services/index';

@Component({
  selector: 'app-print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrintDialogComponent implements OnInit {
  eligibilityCompleteData: any;
  benefitList: any;
  updatedBenefitArray: any = [];
  outNetworkCheck = false;
  checkAll = false;

  constructor(private router: Router,
              private dataSharingService: DataSharingService,
              public dialogRef: MatDialogRef<PrintDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.eligibilityCompleteData = data.eligibilityCompleteData;
    this.benefitList = data.benefitList;
    this.benefitList.forEach(benefit => {
      benefit.checked = false;
    });
  }

  ngOnInit() {
  }

  // Navigate to print preview page
  onPrintClick() {
    this.updatedBenefitArray = [];
    this.benefitList.forEach(eachBenefit => {
      if (eachBenefit.checked === true) {
        this.updatedBenefitArray.push(eachBenefit);
      }
    });
    // Subscriber benefits will be updated
    if (Object.keys(this.eligibilityCompleteData[0]['plan']).length === 1 ) {
      // In case of Single eligibility response
      this.eligibilityCompleteData[0]['plan'][0]['benefitsN'] = this.updatedBenefitArray;
      // If dependent data is present, dependent benefits will be updated
      if (this.eligibilityCompleteData[0]['plan'][0]['dependent'] !== undefined ) {
        this.eligibilityCompleteData[0]['plan'][0]['dependent']['benefitsN'] = this.updatedBenefitArray;
      }
    } else {
      // In case of multi eligibility response
      this.eligibilityCompleteData[0]['plan']['benefitsN'] = this.updatedBenefitArray;
      // If dependent data is present, dependent benefits will be updated
      if (this.eligibilityCompleteData[0]['plan']['dependent'] !== undefined ) {
        this.eligibilityCompleteData[0]['plan']['dependent']['benefitsN'] = this.updatedBenefitArray;
      }
    }

    this.eligibilityCompleteData[0]['outNetworkCheck'] = this.outNetworkCheck;
    this.dataSharingService.setPrintDataFromInquiryDetails(this.eligibilityCompleteData);
    this.dialogRef.close();
    this.router.navigate(['/client/eligibility/print-preview']);
  }

  // Out of Network Check
  outNetworkOption() {
    this.outNetworkCheck = !this.outNetworkCheck;
  }

  // Check all benefits
  checkAllBenefits() {
    this.checkAll = !this.checkAll;
    this.benefitList.forEach(benefit => {
      benefit.checked = this.checkAll;
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
