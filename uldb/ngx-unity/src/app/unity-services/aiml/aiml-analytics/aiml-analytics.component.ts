import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { UnityDeviceType, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AIMLSummaryAlertsCountViewData } from '../../aiml-summary/aiml-summary.service';
import { AimlAnalyticsEventsService } from '../aiml-analytics-events/aiml-analytics-events.service';
import { AIMLAnalyticsSummaryViewData, AIMLEventCountByDeviceTypeViewData, AIMLNoisyHostsViewData, AIMLRuleViewData, AIMLRulesViewTypes, AIMLTrendByTimelineViewData, AimlAnalyticsService, AnalyticsFilterFormData } from './aiml-analytics.service';


@Component({
  selector: 'aiml-analytics',
  templateUrl: './aiml-analytics.component.html',
  styleUrls: ['./aiml-analytics.component.scss'],
  providers: [AimlAnalyticsService, AimlAnalyticsEventsService]
})
export class AimlAnalyticsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormData: AnalyticsFilterFormData;

  datacenters: Array<DatacenterFast> = [];
  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  clouds: Array<DeviceCRUDPrivateCloudFast> = [];
  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  deviceTypes: Array<UnityDeviceType> = [];
  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'type',
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  duration = UnityTimeDuration;

  summaryData: AIMLAnalyticsSummaryViewData = new AIMLAnalyticsSummaryViewData();
  alertsData: AIMLSummaryAlertsCountViewData = new AIMLSummaryAlertsCountViewData();

  trendByTimelineViewData: AIMLTrendByTimelineViewData = new AIMLTrendByTimelineViewData();
  eventCountByDeviceTypeViewData: AIMLEventCountByDeviceTypeViewData = new AIMLEventCountByDeviceTypeViewData();
  noisyHostsViewData: AIMLNoisyHostsViewData = new AIMLNoisyHostsViewData();

  ruleTypes = AIMLRulesViewTypes;
  selectedRuleType: string = AIMLRulesViewTypes.SUPPRESSION;
  rulesViewData: AIMLRuleViewData = new AIMLRuleViewData();

  constructor(private svc: AimlAnalyticsService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private storageService: StorageService,) { }

  ngOnInit() {
    this.getDropDownData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.spinner.stop(this.rulesViewData.loader);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDropDownData();
  }

  getDropDownData() {
    this.spinner.start('main');
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = _clone(res[0]);
      this.deviceTypes = _clone(res[1]);
      this.buildForm()
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching filter data!!'));
    });
  }

  getPrivateCloudsByDC() {
    this.clouds = [];
    from(this.filterFormData.datacenters).pipe(
      mergeMap((dcId: string) => this.svc.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(res => {
        this.clouds = this.clouds.concat(res);
      })
  }

  buildForm() {
    this.filterForm = this.svc.buildFilterForm(this.datacenters, this.deviceTypes);
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    this.filterFormData = this.filterForm.getRawValue();
    this.getPrivateCloudsByDC();

    this.handleFormSubscriptions();
    this.filterData();
  }

  handleWidgetForms() {
    if (this.trendByTimelineViewData) {
      this.trendByTimelineViewData.form = _clone(this.svc.getForm(this.filterFormData.timeline, 'all'));
    }
    if (this.eventCountByDeviceTypeViewData) {
      this.eventCountByDeviceTypeViewData.form = _clone(this.svc.getForm(this.filterFormData.timeline));
    }
    if (this.noisyHostsViewData) {
      this.noisyHostsViewData.form = _clone(this.svc.getForm(this.filterFormData.timeline));
    }
    if (this.rulesViewData) {
      this.rulesViewData.form = _clone(this.svc.getForm(this.filterFormData.timeline));
    }
  }

  handleFormSubscriptions() {
    this.filterForm.get('datacenters').valueChanges.subscribe(res => {
      this.filterFormData.datacenters = res;
    })
    this.filterForm.get('private_clouds').valueChanges.subscribe(res => {
      this.filterFormData.private_clouds = res;
    })
    this.filterForm.get('device_types').valueChanges.subscribe(res => {
      this.filterFormData.device_types = res;
    })
    this.filterForm.get('timeline').valueChanges.subscribe(res => {
      this.filterFormData.timeline = res;
    })
  }

  filterData() {
    this.handleWidgetForms();
    this.getAnalyticsSummary();
    this.getAlertsCountByDeviceType();
    this.getTrendsByTimeline();
    this.getEventsCountByDeviceType();
    this.getNoisyHosts();
    this.getRules(this.selectedRuleType);
  }

  getAnalyticsSummary() {
    this.svc.getAnalyticsSummary(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.svc.convertToSummaryViewdata(res);
    }, err => {
      this.notification.error(new Notification('Error while fetching summary!!'));
    });
  }

  getAlertsCountByDeviceType() {
    this.svc.getAlertsCountByDeviceType(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsData = this.svc.convertToAlertsCountViewdata(res);
    }, err => {
      this.notification.error(new Notification('Error while fetching alerts count!!'));
    });
  }

  getTrendsByTimeline() {
    this.spinner.start(this.trendByTimelineViewData.loader);
    this.trendByTimelineViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue(), this.trendByTimelineViewData.form.getRawValue());
    this.svc.getTrendsByTimeline(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trendByTimelineViewData.chartData = this.svc.convertToTrendsByTimelineChartData(obj.timeline, res);
      this.spinner.stop(this.trendByTimelineViewData.loader);
    }, err => {
      this.spinner.stop(this.trendByTimelineViewData.loader);
      this.notification.error(new Notification('Error while fetching trends by timeline!!'));
    });
  }

  getEventsCountByDeviceType() {
    this.spinner.start(this.eventCountByDeviceTypeViewData.loader);
    this.eventCountByDeviceTypeViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue(), this.eventCountByDeviceTypeViewData.form.getRawValue());
    this.svc.getEventsCountByDeviceType(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.eventCountByDeviceTypeViewData.chartData = this.svc.convertToEventsCountByDeviceTypeChartData(res);
      }
      this.spinner.stop(this.eventCountByDeviceTypeViewData.loader);
    }, err => {
      this.spinner.stop(this.eventCountByDeviceTypeViewData.loader);
      this.notification.error(new Notification('Error while fetching event count by device type!!'));
    });
  }

  getNoisyHosts(timeline?: string) {
    this.spinner.start(this.noisyHostsViewData.loader);
    this.noisyHostsViewData.data = [];
    this.noisyHostsViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue(), this.noisyHostsViewData.form.getRawValue());
    this.svc.getNoisyHosts(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHostsViewData.data = this.svc.convertToNoisyHostsListData(res);
      if (this.noisyHostsViewData.data.length) {
        this.noisyHostsViewData.chartData = this.svc.convertToNoisyHostsChartData(this.noisyHostsViewData.data);
      }
      this.spinner.stop(this.noisyHostsViewData.loader);
    }, err => {
      this.spinner.stop(this.noisyHostsViewData.loader);
      this.notification.error(new Notification('Error while fetching noisy hosts!!'));
    });
  }

  changeRuleView(ruleType: string) {
    this.rulesViewData.data = [];
    this.rulesViewData.form = this.svc.getForm(this.filterFormData.timeline);
    this.getRules(ruleType);
  }

  getRules(ruleType: string) {
    this.selectedRuleType = ruleType;
    this.spinner.start(this.rulesViewData.loader);
    this.rulesViewData.data = [];
    let obj = Object.assign({}, this.filterForm.getRawValue(), this.noisyHostsViewData.form.getRawValue());
    this.svc.getRules(ruleType, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop(this.rulesViewData.loader);
      this.rulesViewData.data = this.svc.convertToAIMLRulesViewData(res);
    }, err => {
      this.spinner.stop(this.rulesViewData.loader);
      this.notification.error(new Notification('Error while fetching rules!!'));
    });
  }

  goTo(target: string) {
    switch (target) {
      case 'summary': this.router.navigate(['summary'], { relativeTo: this.route.parent }); break;
      case 'rules': this.router.navigate(['aiml', 'rules', 'firstresponsepolicies'], { relativeTo: this.route.parent.parent }); break;
      case 'event-analytics':
        this.storageService.put('analytics-formdata', this.filterForm.getRawValue(), StorageType.SESSIONSTORAGE);
        this.router.navigate(['analytics/event-analytics'], { relativeTo: this.route.parent });
        break;
      default: this.router.navigate(['../../', 'aiml-event-mgmt', target], { relativeTo: this.route });
    }
  }
}
