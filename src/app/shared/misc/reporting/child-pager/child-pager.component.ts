import {Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-child-pager',
  templateUrl: './child-pager.component.html',
  styleUrls: ['./child-pager.component.scss']
})
export class ChildPagerComponent implements OnInit, AfterViewInit {
  @Input() currentOffset: number;
  @Input() pageSize: number;
  @Input() totalRecords: number;
  @Input() reportName: string;
  @Output() prevPager: EventEmitter<number> = new EventEmitter();
  @Output() nextPager: EventEmitter<number> = new EventEmitter();
  @Output() changeSize: EventEmitter<number> = new EventEmitter();
  totalPages = 0;
  preClass = 'pre disabled';
  nextClass = 'next';
  constructor() { }

  ngOnInit() {
    console.log(this.reportName);
    if (this.totalRecords % this.pageSize === 0 ) {
      this.totalPages = this.totalRecords / this.pageSize ;
    } else {
      this.totalPages = Math.floor( this.totalRecords / this.pageSize) + 1;
    }
    this.nextClass =
        ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
    this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
  }

  ngAfterViewInit(): void {
    const elem = document.getElementById('childPager');
    elem.scrollIntoView();
  }


  updatePageSize(event) {
    this.pageSize = event.value;
    if (this.totalRecords % this.pageSize === 0 ) {
      this.totalPages = this.totalRecords / this.pageSize ;
    } else {
      this.totalPages = Math.floor( this.totalRecords / this.pageSize) + 1;
    }
    this.nextClass =
        ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
    this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
    this.changeSize.emit(this.pageSize);

  }

  prevPage(cls) {
    if (cls === 'pre disabled') {
      return false;
    }
    this.currentOffset = this.currentOffset - 1;
    this.nextClass =
        ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
    this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
    this.prevPager.emit(this.currentOffset);
  }

  nextPage(cls) {
    if (cls === 'next disabled') {
      return false;
    }

    this.currentOffset = this.currentOffset + 1;
    this.nextClass =
        ((this.totalPages === (this.currentOffset + 1)) || this.totalPages === 0) ? 'next disabled' : 'next';
    this.preClass = (this.currentOffset === 0) ? 'pre disabled' : 'pre';
    this.nextPager.emit(this.currentOffset);
  }

  getCaption(reportName) {
    switch (reportName) {
      case 'loginLogout': return 'Login Logout Records';
      case 'nEusage': return 'Net Exchange Results';
      case 'userlistbyOrganization': return 'user list by organization records';
      case 'transTotals': return 'Transaction Totals';
     default: return reportName;
    }
  }

}
