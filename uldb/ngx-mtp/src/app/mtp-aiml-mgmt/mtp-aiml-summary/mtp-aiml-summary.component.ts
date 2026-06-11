import { Component, OnDestroy, OnInit } from '@angular/core';
import { AIMLSummaryAlertsCountViewData, AIMLSummaryNoisyEventsViewData, AIMLSummaryNoisyHostsViewData, AIMLSummaryViewData, MtpAimlSummaryService, eventCountTargets } from './mtp-aiml-summary.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppUtilityService, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppLevelService } from 'src/app/app-level.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MtpAimlMgmtService } from '../mtp-aiml-mgmt.service';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { MTPEventCountByTarget } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'mtp-aiml-summary',
  templateUrl: './mtp-aiml-summary.component.html',
  styleUrls: ['./mtp-aiml-summary.component.scss'],
  providers: [MtpAimlSummaryService]
})
export class MtpAimlSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  tenants: string[] = [];
  summaryData: AIMLSummaryViewData;
  alertsData: AIMLSummaryAlertsCountViewData;
  noisyEvents: AIMLSummaryNoisyEventsViewData[] = [];
  noisyHosts: AIMLSummaryNoisyHostsViewData[] = [];
  eventsData: MTPEventCountByTarget[] = [];

  duration = UnityTimeDuration;
  eventCountTargets: Array<{ name: string, key: string }> = eventCountTargets;
  eventCountForm: FormGroup;
  eventsCountChartData: UnityChartData;

  constructor(private svc: MtpAimlSummaryService,
    private aimlSvc: MtpAimlMgmtService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private refreshService: DataRefreshBtnService,) {
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.aimlSvc.filterChangeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(filterData => {
      this.tenants = filterData.tenants;
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.getConditionsSummary();
    this.buildEventCountForm();
    this.getAlertsCountByDeviceType();
    this.getNoisyEvents();
    this.getNoisyHosts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getConditionsSummary();
    this.buildEventCountForm();
    this.getAlertsCountByDeviceType();
    this.getNoisyEvents();
    this.getNoisyHosts();
  }

  getConditionsSummary() {
    this.spinner.start('main');
    this.svc.getConditionsSummary(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.svc.convertToSummaryViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching summary!!'));
    });
  }

  getAlertsCountByDeviceType() {
    this.spinner.start('main');
    this.svc.getAlertsCountByDeviceType(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsData = this.svc.convertToAlertsCountViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  getNoisyEvents() {
    this.spinner.start('main');
    this.svc.getNoisyEvents(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyEvents = this.svc.convertToNoisyEventsViewdata(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching noisy alerts!!'));
    });
  }

  getNoisyHosts() {
    this.spinner.start('main');
    this.svc.getNoisyHosts(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHosts = this.svc.convertToNoisyHostsViewData(res);;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  buildEventCountForm() {
    this.eventCountForm = this.svc.buildEventsCountForm();
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

  getEventsCount() {
    this.spinner.start('main');
    this.svc.getEventsCount(this.tenants, this.eventCountForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventsData = res;
      this.eventsCountChartData = this.svc.convertToEventsCountChartData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  goTo(target: string) {
    switch (target) {
      case 'analytics': this.router.navigate(['analytics'], { relativeTo: this.route.parent }); break;
      case 'rules': this.router.navigate(['aiml-event-mgmt', 'rules', 'suppressions'], { relativeTo: this.route.parent.parent }); break;
      default: this.router.navigate(['../../', 'aiml-event-mgmt', target], { relativeTo: this.route });
    }
  }

}
