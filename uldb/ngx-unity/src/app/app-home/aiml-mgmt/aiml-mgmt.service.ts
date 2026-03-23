import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_AIOPS_ALERTS_COUNT, GET_AIOPS_CONDITIONS_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { DashboardAIMLConditionsSummary, DashboardAIMLConditionsSummaryData, DashboardAIMLSummaryAlertCountByDeviceType } from './aiml-mgmt.type';

@Injectable()
export class AimlMgmtService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,) { }

  getConditionsSummary() {
    return this.http.get<DashboardAIMLConditionsSummary>(GET_AIOPS_CONDITIONS_SUMMARY());
  }

  convertToSummaryViewdata(summary: DashboardAIMLConditionsSummary): DashboardAIMLSummaryViewData {
    let a: DashboardAIMLSummaryViewData = new DashboardAIMLSummaryViewData();
    a.conditions = summary.total.condition_count;
    a.critical = summary.total.critical;
    a.warning = summary.total.warning;
    a.information = summary.total.information;

    a.events = summary.total.event_count;
    a.eventReductionPercentage = summary.total.event_count ? Math.round(((summary.total.event_count - summary.total.condition_count) / summary.total.event_count) * 100) : 0;
    a.chartData = this.convertToSummaryChartData(summary.total)
    return a;
  }

  convertToSummaryChartData(currentSummary: DashboardAIMLConditionsSummaryData): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    view.lables.push('Critical', 'Warning', 'Information');
    let colors: string[] = [];
    view.lables.forEach(lb => {
      switch (lb) {
        case 'Critical':
          view.piedata.push(currentSummary.critical);
          colors.push('#cc0000');
          break;
        case 'Warning':
          view.piedata.push(currentSummary.warning);
          colors.push('#ff8800');
          break;
        default:
          view.piedata.push(currentSummary.information);
          colors.push('#378ad8');
          break;
      }
    })
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.aspectRatio = 1.5;
    view.options.cutoutPercentage = 70;
    view.options.legend.position = 'right';
    view.options.legend.labels = {
      boxWidth: 25, padding: 10, usePointStyle: true,
    };
    return view;
  }

  getAlertsCountByDeviceType() {
    return this.http.post<DashboardAIMLSummaryAlertCountByDeviceType[]>(GET_AIOPS_ALERTS_COUNT(), {});
  }

  convertToAlertsCountViewdata(alertData: DashboardAIMLSummaryAlertCountByDeviceType[]): DashboardAIMLSummaryAlertsCountViewData {
    let a: DashboardAIMLSummaryAlertsCountViewData = new DashboardAIMLSummaryAlertsCountViewData();
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

export class DashboardAIMLSummaryViewData {
  constructor() { }
  conditions: number = 0;
  critical: number = 0;
  warning: number = 0;
  information: number = 0;

  events: number = 0;
  eventReductionPercentage: number = 0;

  chartData: UnityChartData;
}

export class DashboardAIMLSummaryAlertsCountViewData {
  constructor() { }
  compute: number = 0;
  network: number = 0;
  storage: number = 0;
  others: number = 0;
}
