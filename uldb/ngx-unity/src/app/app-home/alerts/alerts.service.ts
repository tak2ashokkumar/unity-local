import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_DASHBOARD_ALERTS_DATA, POLL_DASHBOARD_ALERT_DATA } from 'src/app/shared/api-endpoint.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AlertsService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getAlertsCount(): Observable<DashboardAlertsWidget> {
    return this.http.get<DashboardAlertsWidget>(GET_DASHBOARD_ALERTS_DATA());
  }

  convertToViewData(alertCounts: DashboardAlertsWidget): AlertsViewData {
    let viewData: AlertsViewData = new AlertsViewData();
    viewData.totalCount = alertCounts.total_count;
    viewData.hypervisorAlertCount = alertCounts.hypervisor_alert_count;
    viewData.hypervisorBarColor = alertCounts.hypervisor_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.bmServerAlertCount = alertCounts.bm_server_alert_count;
    viewData.bmsBarColor = alertCounts.bm_server_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.firewallAlertCount = alertCounts.firewall_alert_count;
    viewData.firewallBarColor = alertCounts.firewall_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.switchAlertCount = alertCounts.switch_alert_count;
    viewData.switchBarColor = alertCounts.switch_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.loadBalancerAlertCount = alertCounts.load_balancer_alert_count;
    viewData.lbBarColor = alertCounts.load_balancer_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.vmAlertCount = alertCounts.vm_alert_count;
    viewData.vmsBarColor = alertCounts.vm_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.pduAlertCount = alertCounts.pdu_alert_count;
    viewData.pduBarColor = alertCounts.pdu_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.sanAlertCount = alertCounts.storage_device_alert_count;
    viewData.sanBarColor = alertCounts.storage_device_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.macMiniAlertCount = alertCounts.mac_device_alert_count;
    viewData.macMiniBarColor = alertCounts.mac_device_alert_count > 0 ? 'bg-warning' : 'bg-primary';

    viewData.drillDownLink = `/unityview/alerts/all`;
    viewData.hypervisorDrillDownLink = `/unityview/alerts/hypervisors`;
    viewData.bmServerDrillDownLink = `/unityview/alerts/baremetalservers`;
    viewData.firewallDrillDownLink = `/unityview/alerts/firewalls`;
    viewData.switchDrillDownLink = `/unityview/alerts/switches`;
    viewData.lbDrillDownLink = `/unityview/alerts/loadbalancers`;
    viewData.vmDrillDownLink = `/unityview/alerts/vms`;
    viewData.pduDrillDownLink = `/unityview/alerts/pdus`;
    viewData.sanDrillDownLink = `/unityview/alerts/storage`;
    viewData.macMiniDrillDownLink = `/unityview/alerts/macdevices`;
    return viewData;
  }

  getPathByDeviceType(type: DeviceMapping) {
    switch (type) {
      case DeviceMapping.HYPERVISOR:
        return `/unityview/alerts/hypervisors`;
      case DeviceMapping.BARE_METAL_SERVER:
        return `/unityview/alerts/baremetalservers`;
      case DeviceMapping.FIREWALL:
        return `/unityview/alerts/firewalls`;
      case DeviceMapping.SWITCHES:
        return `/unityview/alerts/switches`;
      case DeviceMapping.LOAD_BALANCER:
        return `/unityview/alerts/loadbalancers`;
      case DeviceMapping.VIRTUAL_MACHINE:
        return `/unityview/alerts/vms`;
      case DeviceMapping.PDU:
        return `/unityview/alerts/pdus`;
      case DeviceMapping.STORAGE_DEVICES:
        return `/unityview/alerts/storage`;
      case DeviceMapping.MAC_MINI:
        return `/unityview/alerts/macdevices`;
      default:
        return `/unityview/alerts/all`;
    }
  }

  pollAlertCount(): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_DASHBOARD_ALERT_DATA())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }
}

export class AlertsViewData {
  totalCount: number = 0;
  hypervisorAlertCount: number = 0;
  hypervisorBarColor: string;
  vmAlertCount: number = 0;
  vmsBarColor: string;
  bmServerAlertCount: number = 0;
  bmsBarColor: string;
  firewallAlertCount: number = 0;
  firewallBarColor: string;
  switchAlertCount: number = 0;
  switchBarColor: string;
  loadBalancerAlertCount: number = 0;
  lbBarColor: string;
  pduAlertCount: number = 0;
  pduBarColor: string;
  sanAlertCount: number = 0;
  sanBarColor: string;
  macMiniAlertCount: number = 0;
  macMiniBarColor: string;
  loaderName: string = 'dashboardAlerts';
  drillDownLink: string;
  hypervisorDrillDownLink: string;
  bmServerDrillDownLink: string;
  firewallDrillDownLink: string;
  switchDrillDownLink: string;
  lbDrillDownLink: string;
  vmDrillDownLink: string;
  pduDrillDownLink: string;
  sanDrillDownLink: string;
  macMiniDrillDownLink: string;
  constructor() { }
}
