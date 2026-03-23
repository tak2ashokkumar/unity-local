import { Component, OnDestroy, OnInit } from '@angular/core';
import { AIHealthChartViewData, AppDataType, ApplicationDiscoveryAiHealthAnalysisService } from './application-discovery-ai-health-analysis.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AIHealthReportResponse } from './application-discovery-ai-health-analysis.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'application-discovery-ai-health-analysis',
  templateUrl: './application-discovery-ai-health-analysis.component.html',
  styleUrls: ['./application-discovery-ai-health-analysis.component.scss'],
  providers: [ApplicationDiscoveryAiHealthAnalysisService]
})
export class ApplicationDiscoveryAiHealthAnalysisComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  appData: AppDataType;
  aiHealthViewData: AIHealthReportResponse;
  aiHealthDoughnutChart: AIHealthChartViewData = new AIHealthChartViewData();

  constructor(private svc: ApplicationDiscoveryAiHealthAnalysisService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    public storage: StorageService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    this.appData = <AppDataType>this.storage.getByKey('app-data', StorageType.SESSIONSTORAGE);
    this.getAiHealthData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAiHealthData() {
    this.spinner.start('main');
    this.svc.getAiHealthData(this.appData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.aiHealthViewData = res.response;
      this.aiHealthDoughnutChart.healthChartData = this.svc.convertToHalfDoughnutByPercentage(this.aiHealthViewData.ai_health_summary.ai_health_summary_percentage);
      this.spinner.stop('main');
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting Data'));
      this.spinner.stop('main');
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'bg-danger-soft text-danger';
      case 'warning':
        return 'bg-warning-soft text-warning';
      case 'information':
        return 'bg-info-soft text-info';
      default:
        return 'bg-success-soft text-success';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'Highly Impacted';
      case 'warning':
        return 'Impacted';
      case 'information':
        return 'Information';
      default:
        return status;
    }
  }


}
