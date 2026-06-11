import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MTPAIMLSummary, MTPAlertCountByDeviceType } from 'src/app/shared/SharedEntityTypes/aiml.type';

@Injectable()
export class MtpDashboardAlertsService {

  constructor(private http: HttpClient) { }

  getConditionsSummary(): Observable<MTPAIMLSummary> {
    return this.http.get<MTPAIMLSummary>(`/customer/mtp/conditions/summary/`);
  }

  convertToSummaryViewdata(summary: MTPAIMLSummary): MTPDashboardAlertsSummaryViewData {
    let a: MTPDashboardAlertsSummaryViewData = new MTPDashboardAlertsSummaryViewData();
    a.conditions = summary.total.condition_count;
    a.critical = summary.total.critical;
    a.warning = summary.total.warning;
    a.information = summary.total.information;

    a.events = summary.total.event_count;
    a.eventReductionPercentage = summary.total.event_count ? Math.round(((summary.total.event_count - summary.total.condition_count) / summary.total.event_count) * 100) : 0;
    return a;
  }

  getAlertCounts(): Observable<MTPAlertCountByDeviceType[]> {
    return this.http.post<MTPAlertCountByDeviceType[]>(`/customer/mtp/alerts/count/`, {});
  }

  convertToAlertsCountViewdata(alertData: MTPAlertCountByDeviceType[]): MTPDashboardAlertsCountViewData {
    let a: MTPDashboardAlertsCountViewData = new MTPDashboardAlertsCountViewData();
    alertData.map(ad => {
      switch (ad.device_type) {
        case 'switch':
        case 'firewall':
        case 'load_balancer': a.network = a.network + ad.alert_count; break;
        case 'hypervisor':
        case 'baremetal':
        case 'vm':
        case 'mac': a.compute += ad.alert_count; break;
        case 'storage': a.storage += ad.alert_count; break;
        default: a.others += ad.alert_count; break;
      }
    })
    return a;
  }
}

export class MTPDashboardAlertsSummaryViewData {
  constructor() { }
  conditions: number = 0;
  critical: number = 0;
  warning: number = 0;
  information: number = 0;

  events: number = 0;
  eventReductionPercentage: number = 0;
}

export class MTPDashboardAlertsCountViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}
