import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardAssetCountsViewData, DashboardAssetStatsByDeviceTypeViewData, MtpDashboardAssetsService } from './mtp-dashboard-assets.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { MTPTotalAssetCounts } from 'src/app/shared/SharedEntityTypes/asset-stats.type';

@Component({
  selector: 'mtp-dashboard-assets',
  templateUrl: './mtp-dashboard-assets.component.html',
  styleUrls: ['./mtp-dashboard-assets.component.scss'],
  providers: [MtpDashboardAssetsService]
})
export class MtpDashboardAssetsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  summaryView: DashboardAssetCountsViewData = new DashboardAssetCountsViewData();
  viewData: DashboardAssetStatsByDeviceTypeViewData[] = [];
  constructor(private svc: MtpDashboardAssetsService,
    private notification: AppNotificationService,
    private router: Router,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    this.getTotalAssetStats();
    setTimeout(() => {
      this.getAssetStatsByDeviceType();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('dashboard-assets');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTotalAssetStats() {
    this.svc.getTotalAssetStats().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryView = this.svc.convertToAssetCountsViewdata(res);
    }, err => {
      this.summaryView = null;
    });
  }

  getAssetStatsByDeviceType() {
    this.spinner.start('dashboard-assets');
    this.svc.getAssetStatsByDeviceType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToAssetStatsByTypeViewData(res);
      this.spinner.stop('dashboard-assets');
    }, err => {
      this.spinner.stop('dashboard-assets');
    });
  }

}
