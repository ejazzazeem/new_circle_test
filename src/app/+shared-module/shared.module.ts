import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatSelectModule, MatOptionModule, MatSlideToggleModule, MatDatepickerModule, MatNativeDateModule,
  MatAutocompleteModule, MatCheckboxModule, MatListModule, MatInputModule, MatButtonModule, MatTabsModule, MatRadioModule,
  MatExpansionModule, MatButtonToggleModule
} from '@angular/material';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DataTablesModule } from 'angular-datatables';
import { FooterComponent, AssociatedTaxIdComponent, ConfirmDialogComponent } from '@misc/index';
import { RouterModule } from '@angular/router';
import {TitleCasePipe, RoundPipe, ConvertStringToDate, PercentagePipe, ArraySortPipe, ConvertStringToDateMulti,
ConvertStringToTime, FilterDate, ZipCodeMaskPipe, PhoneMaskPipe, CoverageLevel} from '../shared/pipe/index';
import {CustomFormsModule} from 'ng2-validation';
import {SideMenuAdminComponent, SideMenuClientComponent, AllPayerInfoComponent} from '@misc/index';
import {AssociateTaxIdDialogComponent} from '../shared/misc/admin/associate-tax-id-dialog/associate-tax-id-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatSelectModule, MatOptionModule, MatSlideToggleModule, MatDatepickerModule, MatAutocompleteModule, MatCheckboxModule, MatListModule,
    MatInputModule, MatButtonModule, MatTabsModule, MatRadioModule, MatExpansionModule, MatNativeDateModule, MatButtonToggleModule,
    PerfectScrollbarModule,
    DataTablesModule,
    RouterModule,
    CustomFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule, ReactiveFormsModule, CustomFormsModule,
    MatSelectModule, MatOptionModule, MatSlideToggleModule, MatDatepickerModule, MatAutocompleteModule, MatCheckboxModule, MatListModule,
    MatInputModule, MatButtonModule, MatTabsModule, MatRadioModule, MatExpansionModule, MatNativeDateModule, MatButtonToggleModule,
    PerfectScrollbarModule,
    DataTablesModule,
    RouterModule,
    ArraySortPipe,
    TitleCasePipe,
    ConfirmDialogComponent,
    ConvertStringToDate,
    FilterDate,
    ConvertStringToTime,
    ZipCodeMaskPipe,
    PhoneMaskPipe,
    RoundPipe,
    PercentagePipe,
    ConvertStringToDateMulti,
    FooterComponent,
    AssociatedTaxIdComponent,
    AssociateTaxIdDialogComponent,
    CoverageLevel,
    SideMenuAdminComponent,
    SideMenuClientComponent,
    AllPayerInfoComponent
  ],
  declarations: [
    ArraySortPipe,
    TitleCasePipe,
    ConfirmDialogComponent,
    ConvertStringToDate,
    FilterDate,
    ConvertStringToTime,
    ZipCodeMaskPipe,
    PhoneMaskPipe,
    RoundPipe,
    PercentagePipe,
    ConvertStringToDateMulti,
    FooterComponent,
    AssociatedTaxIdComponent,
    AssociateTaxIdDialogComponent,
    CoverageLevel,
    SideMenuAdminComponent,
    SideMenuClientComponent,
    AllPayerInfoComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    AssociateTaxIdDialogComponent
  ]
})
export class SharedModule { }
