import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'table-page-size',
  templateUrl: './table-page-size.component.html',
  styleUrls: ['./table-page-size.component.scss']
})
export class TablePageSizeComponent implements OnInit {
  @Input() currentPageSize: number;
  @Input() totalCount: number;
  @Input() isLargeSize?: boolean;

  @Output('pageSizeChange') pageSize: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  onChange(event: string) {
    if (event == 'all') {
      if (this.totalCount) {
        this.pageSize.emit(this.totalCount);
      }
    } else {
      this.pageSize.emit(Number.parseInt(event));
    }
  }

}

@Component({
  selector: 'table-entries',
  template: `<span class="float-left mb-2" *ngIf="totalCount">Showing {{from}} to {{to}} of {{totalCount}} entries</span>`
})
export class TableEntriesComponent implements OnInit {
  @Input() pageSize: number;
  @Input() pageNo: number;
  @Input() totalCount: number;

  from: number = 0;
  to: number = 0;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let offset = this.pageNo * this.pageSize;
    this.from = offset - this.pageSize + 1;
    this.to = offset > this.totalCount ? this.totalCount : offset;
  }
}