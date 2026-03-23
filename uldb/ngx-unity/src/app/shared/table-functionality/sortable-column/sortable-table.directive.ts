import { Directive, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { SortService, ColumnSortedEvent } from './sort.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[sortableTable]',
  providers: [SortService]
})
export class SortableTableDirective implements OnInit, OnDestroy {

  constructor(private sortService: SortService) { }

  @Output()
  sorted = new EventEmitter<ColumnSortedEvent>();

  private ngUnsubscribe = new Subject();

  ngOnInit() {
    // subscribe to sort changes so we emit and event for this data table
    this.sortService.columnSorted$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      this.sorted.emit(event);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
