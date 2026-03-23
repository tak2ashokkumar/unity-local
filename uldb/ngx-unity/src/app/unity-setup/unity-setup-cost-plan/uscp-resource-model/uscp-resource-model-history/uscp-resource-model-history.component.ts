import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ReourceHistoryItemViewData, UscpResourceModelHistoryService } from './uscp-resource-model-history.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'uscp-resource-model-history',
  templateUrl: './uscp-resource-model-history.component.html',
  styleUrls: ['./uscp-resource-model-history.component.scss'],
  providers: [UscpResourceModelHistoryService]
})
export class UscpResourceModelHistoryComponent implements OnInit, OnDestroy {


  private ngUnsubscribe = new Subject();
  resourceId: string;
  count: number = 0;
  viewData: ReourceHistoryItemViewData[] = [];
  historyData: any;
  historyTableName: any;


  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private svc: UscpResourceModelHistoryService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getHistoryRecords();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getHistoryRecords();
  }

  getHistoryRecords() {
    this.svc.getHistoryRecords(this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.historyData = res;
      this.historyTableName = res[0].resource_name;
      this.count = this.historyData.length;
      this.viewData = this.svc.convertToViewData(this.historyData);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification("Failed to get history data"));
      this.spinner.stop('main');
    });
  }


  toggleStatus(view: any, status: boolean) {

    this.notification.warning(new Notification(`Status cannot be changed here.`));

  }

  goBack() {
    this.router.navigate(['setup/cost-plan/resource-model']);
  }

}
