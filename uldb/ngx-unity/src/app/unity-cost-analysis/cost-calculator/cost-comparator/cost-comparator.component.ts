import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CostComparatorService } from './cost-comparator.service';
import { InstanceComparator } from '../cost-calculator.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'cost-comparator',
  templateUrl: './cost-comparator.component.html',
  styleUrls: ['./cost-comparator.component.scss'],
  providers: [CostComparatorService]
})
export class CostComparatorComponent implements OnInit {
  @Input() instances: InstanceComparator[];
  @Output() deleteInstance = new EventEmitter<number>();
  @Output() resetComparison = new EventEmitter();

  private ngUnsubscribe = new Subject();
  downloadUrl: string = '';
  constructor(private comparatorService: CostComparatorService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() {
  }

  deleteRecord(index: number) {
    this.deleteInstance.emit(index);
  }

  reset() {
    this.resetComparison.emit();
  }

  exportToExcel() {
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);

    a.href = this.comparatorService.exportToExcel(this.instances);
    a.click();
  }

  sendEmail() {
    this.comparatorService.sendEmail(this.instances).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification("Email sent successfully"));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error));
    });
  }

}
