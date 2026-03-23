import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class ApplicationDiscoveryAiHealthAnalysisService {
  private aiSessionId: string | null = null;

  constructor(private http: HttpClient,) { }

  getAiHealthData(appData: AppDataType) {
    const payload = {
      app_id: appData?.appId?.toString(),
      customer_id: appData?.customerId?.toString(),
      session_id: this.generateSessionId(),
      message: "give me a health report of all services of astronomy shop, include failure data as well to give a proper overall report"
    };
    return this.http.post<any>('/aiapm/health', payload);
  }


  convertToHalfDoughnutByPercentage(percent: number | string) {
    const view: UnityChartDetails = new UnityChartDetails();

    const numericPercent = typeof percent === 'string'
      ? Number(percent)
      : percent;

    const safePercent = Number.isFinite(numericPercent)
      ? Math.max(0, Math.min(numericPercent, 100))
      : 0;

    const remaining = 100 - safePercent;
    const color = this.getHealthColor(safePercent);

    view.options = {
      tooltip: { show: false },

      title: [
        {
          text: `${safePercent}%`,
          left: 'center',
          top: '60%',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: color
          }
        }
      ],

      series: [
        {
          type: 'pie',
          radius: ['60%', '85%'],
          center: ['50%', '70%'],
          startAngle: 180,
          avoidLabelOverlap: false,
          label: { show: false },
          silent: true,

          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },

          data: [
            { value: safePercent, itemStyle: { color: color } },
            { value: remaining, itemStyle: { color: '#e9ecef' } },
            { value: 100, itemStyle: { color: 'transparent' } }
          ]
        }
      ]
    };

    return view;
  }


  generateSessionId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }



  private getHealthColor(percent: number): string {
    if (percent <= 30) {
      return '#dc3545'; // danger (red)
    }
    if (percent <= 85) {
      return '#fd7e14'; // warning (orange)
    }
    return '#28a745'; // success (green)
  }

}

export class AIHealthChartViewData {
  constructor() { }
  healthChartData: UnityChartDetails;
}

export interface AppDataType {
  appId: number;
  customerId: number;
}
