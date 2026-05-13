import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { SYNC_IN_PROGRESS_MSG, WIDGET_DATA_LOAD_ERROR } from '../../app-dashboard.component';
import { PersonaDashboard } from '../app-persona-dashboards.type';
import { AppPersonaDashboardViewService, MetricesMappingViewData, PersonaDashboardWidgetViewData } from './app-persona-dashboard-view.service';

@Component({
  selector: 'app-persona-dashboard-view',
  templateUrl: './app-persona-dashboard-view.component.html',
  styleUrls: ['./app-persona-dashboard-view.component.scss'],
  providers: [AppPersonaDashboardViewService]
})
export class AppPersonaDashboardViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeBoard: PersonaDashboard;
  @Input() showHeader: boolean = true;

  private ngUnsubscribe = new Subject();
  dashboardWidgets: PersonaDashboardWidgetViewData[] = [];
  publishedWidgets: PersonaDashboardWidgetViewData[] = [];
  dataSyncEnd: boolean = false;
  dataError: string = null;
  syncInProgressMsg: string = SYNC_IN_PROGRESS_MSG;
  private dashboardRefreshCountDownIntervalId: any;
  dashboardRefreshCountDown: number;
  dashboardId: string;

  constructor(private svc: AppPersonaDashboardViewService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    public userSvc: UserInfoService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.dashboardId = params.get('id');
      if (this.dashboardId) {
        this.getDashboardDetails();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeBoard && this.activeBoard?.uuid) {
      this.loadActiveDashboard();
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

  getDashboardDetails() {
    this.spinner.start('main');
    this.svc.getDashboardDetails(this.dashboardId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.activeBoard = res;
      this.loadActiveDashboard();
    }, err => {
      this.activeBoard = null;
      this.spinner.stop('main');
    });
  }

  loadActiveDashboard() {
    if (!this.activeBoard?.uuid) {
      return;
    }

    this.spinner.start('main');
    this.getDashboardWidgets();
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

  editDashboard(activeBoard: PersonaDashboard) {
    this.router.navigate(['../', activeBoard.uuid, 'edit'], { relativeTo: this.route });
  }

  goToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
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
