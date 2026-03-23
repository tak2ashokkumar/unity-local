import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CostModelHistoryItemViewData, UscpCostModelHistoryService } from './uscp-cost-model-history.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UscpResourceModelHistoryService } from '../../uscp-resource-model/uscp-resource-model-history/uscp-resource-model-history.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'uscp-cost-model-history',
  templateUrl: './uscp-cost-model-history.component.html',
  styleUrls: ['./uscp-cost-model-history.component.scss'],
  providers: [UscpCostModelHistoryService]
})
export class UscpCostModelHistoryComponent implements OnInit, OnDestroy {


  private ngUnsubscribe = new Subject();
  resourceId: string;
  count: number = 0;
  viewData: CostModelHistoryItemViewData[] = [];
  historyData: any;
  historyTableName: any;


  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private svc: UscpCostModelHistoryService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('costModelId');
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
      this.historyTableName = res[0].plan_name;
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
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
