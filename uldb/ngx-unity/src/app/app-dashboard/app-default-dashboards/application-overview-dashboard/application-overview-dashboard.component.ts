import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ApplicationOverviewDashboardService, ApplicationType, DateDropdownOptionsData } from './application-overview-dashboard.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'application-overview-dashboard',
  templateUrl: './application-overview-dashboard.component.html',
  styleUrls: ['./application-overview-dashboard.component.scss'],
  providers: [ApplicationOverviewDashboardService]
})

export class ApplicationOverviewDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  dateDropdownOptions: DateDropdownOptionsData;
  applications: ApplicationType[] = [];
  selectedApplication: ApplicationType;

  constructor(private svc: ApplicationOverviewDashboardService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    public storage: StorageService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getApplications();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getApplications() {
    this.svc.getApplications().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data?.results?.length) {
        this.applications = this.svc.convertToApplicationViewData(data.results);
        this.selectedApplication = this.applications[0];
        this.dateDropdownOptions = this.svc.getDateDropdownOptions();
        this.cdr.detectChanges();
        setTimeout(() => {
        }, 0);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching Applications. Please try again later.'));
    });
  };

  onFilterChange(formData: any) {
    this.dateDropdownOptions.formData = formData;
    this.dateDropdownOptions.frequency = this.dateDropdownOptions.options.find(opt => opt.value == formData.period).valueAsFrequency;
  }

  goToExectiveAiSummary() {
    this.storage.put('app-data', { appId: this.selectedApplication.id, customerId: this.selectedApplication.customer }, StorageType.SESSIONSTORAGE);
    this.router.navigate([this.selectedApplication.id, 'executive-ai-business-summary'], { relativeTo: this.route });
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

}
