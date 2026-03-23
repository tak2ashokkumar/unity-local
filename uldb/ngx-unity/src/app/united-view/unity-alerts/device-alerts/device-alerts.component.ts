import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MappedMonitoringTool } from 'src/app/shared/SharedEntityTypes/monitoring-tool-mapping.type';
import { AlertsTabData, tabItems } from '../tabs';

@Component({
  selector: 'device-alerts',
  templateUrl: './device-alerts.component.html',
  styleUrls: ['./device-alerts.component.scss']
})
export class DeviceAlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  tabItem: AlertsTabData;
  monitoringToolMap: MappedMonitoringTool;
  configured: { observium: boolean, zabbix: boolean };
  constructor(private appService: AppLevelService,
    private route: Router,
    private spinnerService: AppSpinnerService) {
    this.tabItem = tabItems.find(ti => ti.url === this.route.url);
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getMappedMonitoringTool();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringToolMap = res;
      this.configured = this.appService.getMonitoringToolByDeviceType(this.tabItem.deviceType, this.monitoringToolMap);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

}
