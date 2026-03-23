import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { AppDataType, ApplicationDiscoveryProblemsImpactAnalysisService, ImpactAnalysisViewData } from './application-discovery-problems-impact-analysis.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'application-discovery-problems-impact-analysis',
  templateUrl: './application-discovery-problems-impact-analysis.component.html',
  styleUrls: ['./application-discovery-problems-impact-analysis.component.scss'],
  providers: [ApplicationDiscoveryProblemsImpactAnalysisService]
})
export class ApplicationDiscoveryProblemsImpactAnalysisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() conditionId: string;
  private ngUnsubscribe = new Subject();
  appData: AppDataType;
  impactAnalysisViewData: ImpactAnalysisViewData;
  showMorePopup = false;
  activeMoreType: 'services' | 'infra' | null = null;
  moreItems: string[] = [];

  constructor(private svc: ApplicationDiscoveryProblemsImpactAnalysisService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    public storage: StorageService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    this.appData = <AppDataType>this.storage.getByKey('app-data', StorageType.SESSIONSTORAGE);
    this.getAiImpactAnalysisData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conditionId'] && changes['conditionId'].currentValue) {
      this.conditionId = changes['conditionId'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAiImpactAnalysisData() {
    this.spinner.start('main');
    this.svc.getAiImpactAnalysisData(this.appData, this.conditionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.impactAnalysisViewData = this.svc.convertToAiImpactAnalysisViewData(res.response);
      this.spinner.stop('main');
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting Data'));
      this.spinner.stop('main');
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Low':
        return 'severity-low';
      case 'Medium':
        return 'severity-medium';
      case 'High':
        return 'severity-high';
      case 'Critical':
        return 'severity-critical';
      default:
        return 'bg-secondary';
    }
  }

  toggleMore(type: 'services' | 'infra', items: string[]) {
    if (this.activeMoreType === type && this.showMorePopup) {
      this.showMorePopup = false;
      this.activeMoreType = null;
      return;
    }

    this.moreItems = items;
    this.activeMoreType = type;
    this.showMorePopup = true;
  }


}
