import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { SYNC_IN_PROGRESS_MSG, WIDGET_DATA_LOAD_ERROR } from '../app-dashboard.component';
import { AppDashboardListType, AppDashboardWidgetType } from '../app-dashboard.type';
import { AppDashboardViewService, MetricesMappingViewData } from './app-dashboard-view.service';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './app-dashboard-view.component.html',
  styleUrls: ['./app-dashboard-view.component.scss'],
  providers: [AppDashboardViewService]
})
export class AppDashboardViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeBoard: AppDashboardListType;

  private ngUnsubscribe = new Subject();
  dashboardWidgets: AppDashboardWidgetType[] = [];
  publishedWidgets: AppDashboardWidgetType[] = [];
  dataSyncEnd: boolean = false;
  dataError: string = null;
  syncInProgressMsg: string = SYNC_IN_PROGRESS_MSG;
  private dashboardRefreshCountDownIntervalId: any;
  dashboardRefreshCountDown: number;

  constructor(private svc: AppDashboardViewService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    public userSvc: UserInfoService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeBoard) {
      this.spinner.start('main');
      this.getDashboardWidgets();
      this.syncWidgetsData();
    }
  }
  ngOnDestroy(): void {
    this.spinner.stop('main');
    if (this.dashboardRefreshCountDownIntervalId) {
      clearInterval(this.dashboardRefreshCountDownIntervalId);
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.syncWidgetsData();
  }

  syncWidgetsData() {
    this.dataSyncEnd = false;
    this.dataError = null;
    this.svc.syncWidgetsData(this.activeBoard.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getDashboardWidgets();
      this.dataSyncEnd = true;
    }, err => {
      this.dataSyncEnd = true;
      this.dataError = WIDGET_DATA_LOAD_ERROR;
    })
  }

  getDashboardWidgets() {
    this.svc.getDashboardWidgets(this.activeBoard.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dashboardWidgets = res;
      this.publishedWidgets = this.dashboardWidgets.filter(d => d.status == 'published');
      this.getWidgetChartData();
      this.manageDashboardRefresh();
      this.spinner.stop('main');
    }, err => {
      this.dashboardWidgets = [];
      this.publishedWidgets = [];
      this.spinner.stop('main');
    })
  }

  manageDashboardRefresh() {
    if (this.dashboardRefreshCountDownIntervalId) {
      clearInterval(this.dashboardRefreshCountDownIntervalId);
    }
    this.dashboardRefreshCountDown = this.activeBoard.refresh_interval_in_sec;
    this.dashboardRefreshCountDownIntervalId = setInterval(() => {
      this.dashboardRefreshCountDown--;
      if (this.dashboardRefreshCountDown === 0) {
        this.refreshData(); // or call API if soft refresh
      }
    }, 1000);
  }

  getWidgetChartData() {
    from(this.dashboardWidgets).pipe(
      mergeMap((d) => this.svc.getWidgetChartData(d)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  editDashboard(activeBoard: AppDashboardListType) {
    this.router.navigate([activeBoard.uuid, 'edit'], { relativeTo: this.route });
  }

  goToList() {
    this.router.navigate(['list'], { relativeTo: this.route });
  }

  onDeviceSelect(device: MetricesMappingViewData) {
    device.isSelected = !device.isSelected;
    // this.cdr.detectChanges();
    // this.customTooltipHide();
  }

  getDeviceIcon(device: string) {
    switch (device) {
      case 'switch': return `${FaIconMapping.SWITCH} switches`;
      case 'firewall': return `${FaIconMapping.FIREWALL} firewalls`;
      case 'load_balancer': return `${FaIconMapping.LOAD_BALANCER} lbs`;
      case 'hypervisor': return `${FaIconMapping.HYPERVISOR} hypervisor`;
      case 'bm_server': return `${FaIconMapping.BARE_METAL_SERVER} bms`;
      case 'storage_device': return `${FaIconMapping.STORAGE_DEVICE} storage`;
      case 'Mac Device':
      case 'mac_device': return `${FaIconMapping.MAC_MINI} mac devices`;
      case 'customdevice': return `${FaIconMapping.OTHER_DEVICES} otherdev`;
      case 'custom_vm': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'PDU': return `${FaIconMapping.PDU} pdus`;
      case 'URL': return `${FaIconMapping.URL} text-primary`;
      case 'VM': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'cabinet': return `${FaIconMapping.CABINET} cabinets`;
      case 'pod': return `${FaIconMapping.KUBERNETES}`;
      default: return device;
    }
  }

  getDeviceDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bm_server': return 'Bare Metal';
      case 'vm': return 'VM';
      case 'storage_device': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'cabinet': return 'Cabinet';
      default: return deviceType;
    }
  }

}
