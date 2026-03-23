import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AIMLNoisyHosts } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { TICKET_TYPE, UnityDeviceType, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { AIOPS_HOST_EVENT_TICKET_METADATA, AIOPS_HOST_EVENT_TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { AIMLAnalyticsSummaryViewData, AnalyticsFilterFormData } from '../aiml-analytics/aiml-analytics.service';
import { AIMLEventsByDeviceViewData, AIMLEventsTrendByDadacenterViewData, AIMLEventsTrendByPrivateCloudViewData, AIMLEventsTrendBySeverityViewData, AIMLNoisyEventsViewData, AIMLNoisyHostsEventsByTypeViewData, AimlAnalyticsEventsService } from './aiml-analytics-events.service';

@Component({
  selector: 'aiml-analytics-events',
  templateUrl: './aiml-analytics-events.component.html',
  styleUrls: ['./aiml-analytics-events.component.scss'],
  providers: [AimlAnalyticsEventsService]
})
export class AimlAnalyticsEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  filterForm: FormGroup;
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
  formData: AnalyticsFilterFormData;

  summaryData: AIMLAnalyticsSummaryViewData = new AIMLAnalyticsSummaryViewData();
  trendBySeverityViewData: AIMLEventsTrendBySeverityViewData = new AIMLEventsTrendBySeverityViewData();
  trendByDCViewData: AIMLEventsTrendByDadacenterViewData = new AIMLEventsTrendByDadacenterViewData();
  trendByPCViewData: AIMLEventsTrendByPrivateCloudViewData = new AIMLEventsTrendByPrivateCloudViewData();

  noisyHostsByTypeViewData: AIMLNoisyHostsEventsByTypeViewData = new AIMLNoisyHostsEventsByTypeViewData();
  noisyHosts: AIMLNoisyHosts[] = [];
  noisyEventsViewData: AIMLNoisyEventsViewData = new AIMLNoisyEventsViewData();

  constructor(private eventSvc: AimlAnalyticsEventsService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,) { }

  ngOnInit(): void {
    this.formData = <AnalyticsFilterFormData>this.storageService.getByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
    this.getDropDownData();
    this.getPrivateCloudsByDC();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDropDownData();
  }

  getDropDownData() {
    this.spinner.start('main');
    this.eventSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
    from(this.formData.datacenters).pipe(
      mergeMap((dcId: string) => this.eventSvc.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(res => {
        this.clouds = this.clouds.concat(res);
      })
  }

  buildForm() {
    this.filterForm = this.eventSvc.buildFilterForm(this.formData);
    this.handleWidgetForms();
    this.filterData();
  }

  handleWidgetForms() {
    if (this.noisyHostsByTypeViewData) {
      this.noisyHostsByTypeViewData.form = _clone(this.eventSvc.getWidgetForm());
    }
  }

  filterData() {
    this.getAnalyticsSummary();
    this.getTrendsBySeverity();
    this.getTrendByDatacenter();
    this.getTrendByCloud();
    this.getNoisyHostsByType();
    this.getNoisyEvents();
  }

  getAnalyticsSummary() {
    this.eventSvc.getAnalyticsSummary(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.eventSvc.convertToSummaryViewdata(res);
    }, err => {
      this.notification.error(new Notification('Error while fetching summary!!'));
    });
  }

  getTrendsBySeverity() {
    this.spinner.start(this.trendBySeverityViewData.loader);
    this.trendBySeverityViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue());
    this.eventSvc.getTrendBySeverity(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trendBySeverityViewData.chartData = this.eventSvc.convertToTrendBySeverityChartData(res);
      this.spinner.stop(this.trendBySeverityViewData.loader);
    }, err => {
      this.spinner.stop(this.trendBySeverityViewData.loader);
      this.notification.error(new Notification('Error while fetching trends by severity!!'));
    });
  }

  getTrendByDatacenter() {
    this.spinner.start(this.trendByDCViewData.loader);
    this.trendByDCViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue());
    this.eventSvc.getTrendByDatacenter(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trendByDCViewData.chartData = this.eventSvc.convertToTrendByDatacenterChartData(res.result.data);
      this.spinner.stop(this.trendByDCViewData.loader);
    }, err => {
      this.spinner.stop(this.trendByDCViewData.loader);
      this.notification.error(new Notification('Error while fetching trends by datacenter!!'));
    });
  }

  getTrendByCloud() {
    this.spinner.start(this.trendByPCViewData.loader);
    this.trendByPCViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue());
    this.eventSvc.getTrendByCloud(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.trendByPCViewData.chartData = this.eventSvc.convertToTrendByCloudChartData(res.result.data);
      this.spinner.stop(this.trendByPCViewData.loader);
    }, err => {
      this.spinner.stop(this.trendByPCViewData.loader);
      this.notification.error(new Notification('Error while fetching trends by private cloud!!'));
    });
  }

  async getNoisyHostsByType() {
    this.spinner.start(this.noisyHostsByTypeViewData.loader);
    this.noisyHostsByTypeViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue(), this.noisyHostsByTypeViewData.form.getRawValue());
    this.noisyHosts = await this.eventSvc.getNoisyHosts(obj).toPromise();
    this.eventSvc.getNoisyHostsByType(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHostsByTypeViewData.viewType = 'chart';
      this.noisyHostsByTypeViewData.chartData = this.eventSvc.convertToNoisyHostsByTypeChartData(res);
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
    }, err => {
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
      this.notification.error(new Notification('Error while fetching noisy hosts by type!!'));
    });
  }

  getNoisyEvents() {
    this.spinner.start(this.noisyEventsViewData.loader);
    this.noisyEventsViewData.chartData = null;
    let obj = Object.assign({}, this.filterForm.getRawValue());
    this.eventSvc.getNoisyEvents(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyEventsViewData.chartData = this.eventSvc.convertToNoisyEventsChartData(res);
      this.spinner.stop(this.noisyEventsViewData.loader);
    }, err => {
      this.spinner.stop(this.noisyEventsViewData.loader);
      this.notification.error(new Notification('Error while fetching noisy events!!'));
    });
  }

  showDeviceEvents(host: AIMLNoisyHosts) {
    this.spinner.start(this.noisyHostsByTypeViewData.loader);
    this.eventSvc.getEventsByDevice(host.device, host.sources).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHostsByTypeViewData.viewType = 'list';
      this.noisyHostsByTypeViewData.listData = this.eventSvc.convertToEventsByDeviceListData(host, res);
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
    }, err => {
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
      this.notification.error(new Notification('Error while fetching events by device!!'));
    });
  }

  showDeviceEventChart(ev: AIMLEventsByDeviceViewData) {
    this.spinner.start(this.noisyHostsByTypeViewData.loader);
    this.eventSvc.getDeviceEventChartData(this.formData.timeline, ev.deviceName, ev.source, ev.event).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.noisyHostsByTypeViewData.viewType = 'event-chart';
      this.noisyHostsByTypeViewData.eventChartData = this.eventSvc.convertToDeviceEventsChartData(this.formData.timeline, res);
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
    }, err => {
      this.spinner.stop(this.noisyHostsByTypeViewData.loader);
      this.notification.error(new Notification('Error while fetching event chartdata!!'));
    });
  }

  createTicket(view: AIMLEventsByDeviceViewData) {
    this.ticketService.createTicket({
      subject: AIOPS_HOST_EVENT_TICKET_SUBJECT('Problem', view.deviceName, view.event),
      metadata: AIOPS_HOST_EVENT_TICKET_METADATA(view.deviceType, view.deviceName, view.event),
      type: TICKET_TYPE.PROBLEM,
      staticType: true,
      aiops: true
    });
  }

  goTo(target: string) {
    switch (target) {
      case 'noisy-events':
        this.router.navigate(['analytics/noisy-events'], { relativeTo: this.route.parent });
        break;
      case 'summary':
        this.storageService.removeByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
        this.router.navigate(['summary'], { relativeTo: this.route.parent });
        break;
      case 'analytics':
        this.storageService.removeByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
        this.router.navigate(['analytics'], { relativeTo: this.route.parent });
        break;
      case 'rules':
        this.storageService.removeByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
        this.router.navigate(['aiml', 'rules', 'firstresponsepolicies'], { relativeTo: this.route.parent.parent });
        break;
      default:
        this.storageService.removeByKey('analytics-formdata', StorageType.SESSIONSTORAGE);
        this.router.navigate(['../../', 'aiml-event-mgmt', target], { relativeTo: this.route });
    }
  }
}
