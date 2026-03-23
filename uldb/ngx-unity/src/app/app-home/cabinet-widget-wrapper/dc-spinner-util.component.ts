import { Directive, Input, OnInit, HostListener, Component, OnDestroy } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'dc-spinner-util',
  template: `<app-spinner [name]="spinnerName"></app-spinner>`
})
export class DcSpinnerUtilComponent implements OnInit, OnDestroy {
  @Input() spinnerName: string;
  @Input() parentSubject: Subject<string>;
  private ngUnsubscribe = new Subject();

  constructor(private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.parentSubject.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event == 'start') {
        this.startSpinner();
      } else if (event == 'stop') {
        this.stopSpinner();
      } else {
        throw new Error('invalid action');
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.spinner.stop(this.spinnerName);
  }

  startSpinner() {
    setTimeout(() => {
      this.spinner.start(this.spinnerName);
    }, 0);
  }

  stopSpinner() {
    this.spinner.stop(this.spinnerName);
  }
}
