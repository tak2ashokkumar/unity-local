import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingSummaryService, ExcelOnboardingSummaryViewdata } from './excel-on-boarding-summary.service';

@Component({
  selector: 'excel-on-boarding-summary',
  templateUrl: './excel-on-boarding-summary.component.html',
  styleUrls: ['./excel-on-boarding-summary.component.scss'],
  providers: [ExcelOnBoardingSummaryService]
})
export class ExcelOnBoardingSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  FaIconMapping = FaIconMapping;
  DeviceMapping = DeviceMapping;
  viewData: ExcelOnboardingSummaryViewdata;

  constructor(private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private summarySvc: ExcelOnBoardingSummaryService,
    private router: Router,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.nxtPrvSvc.excelSaveCurrentAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.nxtPrvSvc.continueNextPrev();
    });
  }
  ngOnInit() {
    this.getSummary();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSummary() {
    this.spinner.start('main');
    this.summarySvc.getSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.summarySvc.convertToViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  goPrev() {
    this.nxtPrvSvc.saveNextPrev('prev');
  }

  gotToDashboard() {
    this.router.navigate(['app-dashboard']);
  }

  gotToHome() {
    this.router.navigate(['setup/devices/onboarding']);
  }
}