import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AIMLSummaryAlertsCountViewData, AIMLSummaryNoisyEventsViewData, AIMLSummaryNoisyHostsViewData, AimlSummaryService, AIMLSummaryViewData, ChartData, Duration, eventCountTargets } from './aiml-summary.service';
import { AIMLSummaryEventCount } from './aiml-summary.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'aiml-summary',
  templateUrl: './aiml-summary.component.html',
  styleUrls: ['./aiml-summary.component.scss'],
  providers: [AimlSummaryService]
})
export class AimlSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  summaryData: AIMLSummaryViewData;
  alertsData: AIMLSummaryAlertsCountViewData;
  noisyEvents: AIMLSummaryNoisyEventsViewData[] = [];
  noisyHosts: AIMLSummaryNoisyHostsViewData[] = [];
  eventsData: AIMLSummaryEventCount[] = [];

  duration = Duration;
  eventCountTargets: Array<{ name: string, key: string }> = eventCountTargets;
  eventCountForm: FormGroup;
  eventsCountChartData: ChartData;
  constructor(private summarySvc: AimlSummaryService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,) {
  }

  ngOnInit() {
    this.getConditionsSummary();
    this.getAlertsCountByDeviceType();
    this.getNoisyEvents();
    this.getNoisyHosts();
    this.buildEventCountForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getConditionsSummary();
    this.getAlertsCountByDeviceType();
    this.getNoisyEvents();
    this.getNoisyHosts();
    this.buildEventCountForm();
  }

  getConditionsSummary() {
    this.spinner.start('main');
    this.summarySvc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.summarySvc.convertToSummaryViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching summary!!'));
    });
  }

  getAlertsCountByDeviceType() {
    this.spinner.start('main');
    this.summarySvc.getAlertsCountByDeviceType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsData = this.summarySvc.convertToAlertsCountViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  getNoisyEvents() {
    this.spinner.start('main');
    this.summarySvc.getNoisyEvents().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyEvents = this.summarySvc.convertToNoisyEventsViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching noisy alerts!!'));
    });
  }

  getNoisyHosts() {
    this.spinner.start('main');
    this.summarySvc.getNoisyHosts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHosts = this.summarySvc.convertToNoisyHostsViewData(res);;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  buildEventCountForm() {
    this.eventCountForm = this.summarySvc.buildEventsCountForm();
    this.getEventsCount();

    this.eventCountForm.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getEventsCount();
    })

    // this.eventCountForm.get('duration').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: Duration) => {
    //   this.dateRange = this.graphService.getDateRangeByPeriod(val);
    //   if (this.dateRange) {
    //     this.eventCountForm.get('start_date').patchValue(new Date(this.dateRange.from))
    //     this.eventCountForm.get('end_date').patchValue(new Date(this.dateRange.to))
    //   }
    //   if (val == this.duration.CUSTOM) {
    //     this.eventCountForm.get('start_date').enable();
    //     this.eventCountForm.get('end_date').enable();
    //   } else {
    //     this.eventCountForm.get('start_date').disable();
    //     this.eventCountForm.get('end_date').disable();
    //   }
    //   this.eventCountForm.get('start_date').updateValueAndValidity();
    //   this.eventCountForm.get('end_date').updateValueAndValidity();
    // });
  }

  eventsCountEChartData: UnityChartDetails;
  getEventsCount() {
    this.spinner.start('main');
    this.summarySvc.getEventsCount(this.eventCountForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventsData = res;
      this.eventsCountEChartData = this.summarySvc.convertToEventsCountEChartData(res);
      // this.eventsCountChartData = this.summarySvc.convertToEventsCountChartData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  goTo(target: string) {
    switch (target) {
      case 'analytics': this.router.navigate(['analytics'], { relativeTo: this.route.parent }); break;
      case 'rules': this.router.navigate(['aiml', 'rules', 'firstresponsepolicies'], { relativeTo: this.route.parent.parent }); break;
      default: this.router.navigate(['../../', 'aiml-event-mgmt', target], { relativeTo: this.route });
    }
  }
}
