import { Directive, HostListener, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[tableSeachBox]'
})
export class TableSeachBoxDirective implements OnDestroy {
  private debouncer = new Subject<string>();
  @Output()
  searched = new EventEmitter<string>();
  private ngUnsubscribe = new Subject();

  constructor(private el: ElementRef) {
    this.debouncer.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.searched.emit(value);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('keyup')
  search() {
    let value = (this.el.nativeElement as HTMLInputElement).value.trim();
    this.debouncer.next(value);
  }

}
