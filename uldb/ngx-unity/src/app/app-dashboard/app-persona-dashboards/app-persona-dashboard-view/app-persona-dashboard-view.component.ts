import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EMPTY, from, Subject } from 'rxjs';
import { catchError, finalize, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SYNC_IN_PROGRESS_MSG, WIDGET_DATA_LOAD_ERROR } from '../../app-dashboard.component';
import { PersonaDashboard } from '../app-persona-dashboards.type';
import { AppPersonaDashboardViewService, MetricesMappingViewData, PersonaDashboardWidgetViewData } from './app-persona-dashboard-view.service';

@Component({
  selector: 'app-persona-dashboard-view',
  templateUrl: './app-persona-dashboard-view.component.html',
  styleUrls: ['./app-persona-dashboard-view.component.scss'],
  providers: [AppPersonaDashboardViewService]
})
export class AppPersonaDashboardViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  collectionId: string;
  dashboardId: string;

  dashboard: PersonaDashboard;
  dashboardWidgets: PersonaDashboardWidgetViewData[] = [];
  publishedWidgets: PersonaDashboardWidgetViewData[] = [];
  dataSyncEnd: boolean = true;
  dataError: string = null;
  syncInProgressMsg: string = SYNC_IN_PROGRESS_MSG;
  private dashboardRefreshCountDownIntervalId: any;
  dashboardRefreshCountDown: number = 0;
  private syncingDashboardUuid: string;

  constructor(private svc: AppPersonaDashboardViewService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionId = params.get('collectionId');
      this.dashboardId = params.get('id') || params.get('dashboardId');
      if (this.dashboardId) {
        this.loadDashboard(this.dashboardId);
      } else {
        this.resetDashboard();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearDashboardRefreshTimer();
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.syncWidgetsData();
  }

  get refreshIntervalDisplay(): string {
    return this.formatRefreshInterval(this.getDashboardRefreshInterval());
  }

  loadDashboard(dashboardId: string) {
    if (!dashboardId || this.dashboard?.uuid === dashboardId) {
      return;
    }

    this.resetDashboard();
    this.spinner.start('main');
    this.svc.getDashboardDetails(dashboardId).pipe(
      switchMap(dashboard => {
        if (this.dashboardId !== dashboardId) {
          return EMPTY;
        }

        this.dashboard = dashboard;
        return this.svc.getDashboardWidgets(dashboard.uuid).pipe(
          map(widgets => ({ dashboard, widgets })),
          catchError(err => {
            if (this.dashboardId === dashboardId) {
              this.dashboardWidgets = [];
              this.publishedWidgets = [];
              this.dataError = WIDGET_DATA_LOAD_ERROR;
              this.clearDashboardRefreshTimer();
            }
            return EMPTY;
          })
        );
      }),
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.spinner.stop('main'))
    ).subscribe(({ dashboard, widgets }) => {
      if (this.dashboardId === dashboardId) {
        this.dashboard = dashboard;
        this.setDashboardWidgets(widgets);
        this.manageDashboardRefresh();
        this.syncWidgetsData();
      }
    }, err => {
      if (this.dashboardId === dashboardId) {
        this.showDashboardLoadError();
      }
    });
  }

  syncWidgetsData() {
    const dashboardUuid = this.dashboard?.uuid;
    if (!dashboardUuid || this.syncingDashboardUuid === dashboardUuid) {
      return;
    }

    this.syncingDashboardUuid = dashboardUuid;
    this.dataSyncEnd = false;
    this.dataError = null;
    this.svc.syncWidgetsData(dashboardUuid).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        if (this.syncingDashboardUuid === dashboardUuid) {
          this.syncingDashboardUuid = null;
        }

        if (this.dashboard?.uuid === dashboardUuid) {
          this.dataSyncEnd = true;
          this.resetDashboardRefreshCountdown();
        }
      })
    ).subscribe(res => {
      if (this.dashboard?.uuid === dashboardUuid) {
        this.getDashboardWidgets();
      }
    }, err => {
      if (this.dashboard?.uuid === dashboardUuid) {
        this.dataError = WIDGET_DATA_LOAD_ERROR;
      }
    })
  }

  getDashboardWidgets() {
    const dashboardUuid = this.dashboard?.uuid;
    if (!dashboardUuid) {
      return;
    }

    this.svc.getDashboardWidgets(dashboardUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (this.dashboard?.uuid !== dashboardUuid) {
        return;
      }

      this.setDashboardWidgets(res);
      this.manageDashboardRefresh();
    }, err => {
      if (this.dashboard?.uuid !== dashboardUuid) {
        return;
      }

      this.dashboardWidgets = [];
      this.publishedWidgets = [];
      this.dataError = WIDGET_DATA_LOAD_ERROR;
      this.clearDashboardRefreshTimer();
    })
  }

  private setDashboardWidgets(widgets: PersonaDashboardWidgetViewData[]) {
    this.dashboardWidgets = widgets || [];
    this.publishedWidgets = this.dashboardWidgets.filter(d => d.status == 'published');
    this.getWidgetChartData();
  }

  private resetDashboard() {
    this.dashboard = null;
    this.syncingDashboardUuid = null;
    this.dashboardWidgets = [];
    this.publishedWidgets = [];
    this.dataSyncEnd = true;
    this.dataError = null;
    this.clearDashboardRefreshTimer();
  }

  private showDashboardLoadError() {
    this.resetDashboard();
    this.dataError = WIDGET_DATA_LOAD_ERROR;
  }

  manageDashboardRefresh() {
    this.clearDashboardRefreshTimer();
    if (!this.isDashboardRefreshEnabled()) {
      this.dashboardRefreshCountDown = 0;
      return;
    }

    this.resetDashboardRefreshCountdown();
    this.dashboardRefreshCountDownIntervalId = setInterval(() => {
      this.dashboardRefreshCountDown--;
      if (this.dashboardRefreshCountDown <= 0) {
        this.resetDashboardRefreshCountdown();
        this.refreshData();
      }
    }, 1000);
  }

  private clearDashboardRefreshTimer() {
    if (this.dashboardRefreshCountDownIntervalId) {
      clearInterval(this.dashboardRefreshCountDownIntervalId);
      this.dashboardRefreshCountDownIntervalId = null;
    }
  }

  private isDashboardRefreshEnabled(): boolean {
    const refreshInterval = this.getDashboardRefreshInterval();
    return !!this.dashboard?.refresh && !!refreshInterval && refreshInterval > 0;
  }

  private resetDashboardRefreshCountdown() {
    this.dashboardRefreshCountDown = this.isDashboardRefreshEnabled() ? this.getDashboardRefreshInterval() : 0;
  }

  private getDashboardRefreshInterval(): number {
    return this.dashboard?.refresh_interval_in_sec || 0;
  }

  private formatRefreshInterval(value: number): string {
    if (!value) {
      return 'NA';
    }

    if (value < 60) {
      return `${value} sec${value === 1 ? '' : 's'}`;
    }

    if (value < 3600) {
      const minutes = value / 60;
      return `${this.formatIntervalValue(minutes)} min${minutes === 1 ? '' : 's'}`;
    }

    const hours = value / 3600;
    return `${this.formatIntervalValue(hours)} hour${hours === 1 ? '' : 's'}`;
  }

  private formatIntervalValue(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }

  getWidgetChartData() {
    from(this.dashboardWidgets).pipe(
      mergeMap((d) => this.svc.getWidgetChartData(d)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { }, err => {
        this.dataError = WIDGET_DATA_LOAD_ERROR;
      });
  }

  editDashboard(dashboard: PersonaDashboard) {
    if (!dashboard?.uuid) {
      return;
    }

    this.router.navigate(['/app-dashboard', 'my-dashboards', dashboard.uuid, 'edit']);
  }

  goToList() {
    if (this.collectionId) {
      this.router.navigate(['/app-dashboard', 'collections', this.collectionId]);
      return;
    }

    this.router.navigate(['/app-dashboard', 'my-dashboards']);
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
