import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  onbDetails: OnbDetails;

  constructor(private onboardingStatusService: SharedOnboardingStatusService,
    private notification: AppNotificationService) {
  }

  ngOnInit() {
    this.getOnboardDetails();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOnboardDetails() {
    this.onbDetails = null;
    this.onboardingStatusService.getOnboardDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<OnbDetails>) => {
      this.onbDetails = data.results[0];
    }, err => {
      this.notification.error(new Notification('Problem ocurred in fetching onboarding status. Please try again later.'));
    });
  }
}
