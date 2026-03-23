import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  private debouncer = new Subject<string>();
  private ngUnsubscribe = new Subject();

  @Input() searchValue: string = '';
  @Input() customClass?: string = '';

  @Output() searched = new EventEmitter<string>();
  constructor() {
    this.debouncer.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.searched.emit(value);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get isSmallControl() {
    return this.customClass && this.customClass.includes('form-control-sm') ? true : false;
  }

  onSearched(value: string) {
    this.searchValue = value;
    this.debouncer.next(value);
  }

}