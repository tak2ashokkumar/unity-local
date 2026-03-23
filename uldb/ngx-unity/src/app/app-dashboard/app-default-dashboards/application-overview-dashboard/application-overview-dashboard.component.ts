import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApplicationOverviewDashboardService, DateDropdownOptionsData } from './application-overview-dashboard.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'application-overview-dashboard',
  templateUrl: './application-overview-dashboard.component.html',
  styleUrls: ['./application-overview-dashboard.component.scss'],
  providers: [ApplicationOverviewDashboardService]
})

export class ApplicationOverviewDashboardComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  selectedApplication: string = 'AstronomyShop';
  dateDropdownOptions: DateDropdownOptionsData;
  applicationId: number;
  customerId: number;

  constructor(private svc: ApplicationOverviewDashboardService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    public storage: StorageService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAppId();
    setTimeout(() => {
      this.dateDropdownOptions = this.svc.getDateDropdownOptions();
    }, 0);
  }

  getAppId() {
    this.svc.getApplications().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data?.results?.length) {
        setTimeout(() => {
          let x = data.results.find(app => app.name === "astronomy-shop"); //To fetch the default app id
          this.applicationId = x.id; //To fetch the default app id  
          this.customerId = x.customer;
          this.cdr.detectChanges();
        }, 0);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching Application id'));
    });
  };

  refreshData() {

  }

  onFilterChange(formData: any) {
    this.dateDropdownOptions.formData = formData;
    this.dateDropdownOptions.frequency = this.dateDropdownOptions.options.find(opt => opt.value == formData.period).valueAsFrequency;
  }

  goToExectiveAiSummary() {
    this.storage.put('app-data', { appId: this.applicationId, customerId: this.customerId }, StorageType.SESSIONSTORAGE);
    this.router.navigate([this.applicationId, 'executive-ai-business-summary'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
