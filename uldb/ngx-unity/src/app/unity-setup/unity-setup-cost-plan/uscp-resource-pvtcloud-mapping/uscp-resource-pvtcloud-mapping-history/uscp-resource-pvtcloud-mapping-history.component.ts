import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ResourceMappingHistoryItemViewData, UscpResourcePvtcloudMappingHistoryService } from './uscp-resource-pvtcloud-mapping-history.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'uscp-resource-pvtcloud-mapping-history',
  templateUrl: './uscp-resource-pvtcloud-mapping-history.component.html',
  styleUrls: ['./uscp-resource-pvtcloud-mapping-history.component.scss'],
  providers: [UscpResourcePvtcloudMappingHistoryService]
})
export class UscpResourcePvtcloudMappingHistoryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  resourceId: string;
  count: number = 0;
  viewData: ResourceMappingHistoryItemViewData[] = [];
  historyData: any;
  historyTableName: any;

  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private svc: UscpResourcePvtcloudMappingHistoryService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('mapingId');
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
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
