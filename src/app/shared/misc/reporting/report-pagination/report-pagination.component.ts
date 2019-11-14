import {Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
@Component({
  selector: 'app-report-pagination',
  templateUrl: './report-pagination.component.html',
  styleUrls: ['./report-pagination.component.scss']
})
export class ReportPaginationComponent implements OnInit {
  @Input() currentOffset: number;
  @Input() pageSize: number;
  @Input() totalRecords: number;

  @Output() changePage: EventEmitter<number> = new EventEmitter();
  @Output() changeSize: EventEmitter<number> = new EventEmitter();
  pages: any[] = [];
  ddlNo = 0;
  totalPages = 0;

  constructor() { }

  ngOnInit() {
    this.ddlNo = this.currentOffset + 1;
    this.createPages();
  }

  createPages() {

    if (this.totalRecords % this.pageSize === 0 ) {
      this.totalPages = this.totalRecords / this.pageSize ;
    } else {
      this.totalPages = Math.floor( this.totalRecords / this.pageSize) + 1;
    }

    if (this.totalPages > 0) {
      for(let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    }

  }

  updatePageSize(event) {
    this.pageSize = event.value;
    if (this.totalRecords % this.pageSize === 0 ) {
      this.totalPages = this.totalRecords / this.pageSize ;
    } else {
      this.totalPages = Math.floor( this.totalRecords / this.pageSize) + 1;
    }
    if (this.totalPages > 0) {
      this.pages.splice(0,this.pages.length);
      this.createPages();
    }
    this.changeSize.emit(this.pageSize);

  }

  changeCurrentPage(event) {
    this.currentOffset = event.value -1 ;
    this.changePage.emit(this.currentOffset);
  }

}
