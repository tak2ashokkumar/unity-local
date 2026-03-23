import { Component, OnInit, OnDestroy } from '@angular/core';
import { OnboardStatusViewData, SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service'
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';

@Component({
  selector: 'asset-onboarding-status',
  templateUrl: './asset-onboarding-status.component.html',
  styleUrls: ['./asset-onboarding-status.component.scss']
})
export class AssetOnboardingStatusComponent implements OnInit, OnDestroy {
  public ngUnsubscribe = new Subject();
  onboardStatusViewData: OnboardStatusViewData;
  constructor(private assetOnboardingService: SharedOnboardingStatusService,
    private notification: AppNotificationService,
    private router: Router) {
  }

  ngOnInit() {
    this.getOnboardDetails();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOnboardDetails() {
    this.assetOnboardingService.getOnboardDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<OnbDetails>) => {
      this.onboardStatusViewData = this.assetOnboardingService.changeViewData(data.results[0]);
    }, err => {
      this.notification.error(new Notification('Problem ocurred in fetching onboarding status. Please try again later.'));
    })
  }

  goToOnBoarding() {
    this.router.navigate(['setup', 'onboarding']);
  }
}