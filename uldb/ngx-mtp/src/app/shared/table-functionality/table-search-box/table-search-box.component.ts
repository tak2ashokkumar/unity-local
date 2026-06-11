import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'table-search-box',
  templateUrl: './table-search-box.component.html',
  styleUrls: ['./table-search-box.component.scss']
})
export class TableSearchBoxComponent implements OnInit {
  private debouncer = new Subject<string>();
  private ngUnsubscribe = new Subject();

  @Input() searchValue: string = '';

  @Output() searched = new EventEmitter<string>();

  constructor() {
    this.debouncer.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.searched.emit(value);
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(value: string) {
    this.searchValue = value;
    this.debouncer.next(value);
  }
}
