import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppDataType, ExecutiveAiBusinessSummaryService, ExecutiveAIBusinnesSummaryViewData } from './executive-ai-business-summary.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'executive-ai-business-summary',
  templateUrl: './executive-ai-business-summary.component.html',
  styleUrls: ['./executive-ai-business-summary.component.scss'],
  providers: [ExecutiveAiBusinessSummaryService]
})
export class ExecutiveAiBusinessSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  appId: string;
  appData: AppDataType;
  executiveAIBusinessSummaryViewData: ExecutiveAIBusinnesSummaryViewData;

  constructor(private svc: ExecutiveAiBusinessSummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,

    public storage: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.appId = params.get('appId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.appData = <AppDataType>this.storage.getByKey('app-data', StorageType.SESSIONSTORAGE);
    this.getExectiveAIBusinessSummary();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getExectiveAIBusinessSummary();
  }

  getExectiveAIBusinessSummary() {
    this.svc.getExectiveAIBusinessSummary(this.appId, this.appData?.customerId?.toString()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.executiveAIBusinessSummaryViewData = this.svc.convertToExecutiveAIBusinessSummaryViewData(res.response);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error whlie getting Executive AI Business Summary details'));
      this.spinner.stop('main');
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
