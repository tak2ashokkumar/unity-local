import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StatusSummary } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { BUCostCenterApplications, BULicenceCostCenter, BusinessUnits } from '../../../business-services.type';
import { ServiceTopologyService, UnityTopologyViewType } from './service-topology.service';

@Component({
  selector: 'service-topology',
  templateUrl: './service-topology.component.html',
  styleUrls: ['./service-topology.component.scss']
})
export class ServiceTopologyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  buId: string;

  businessUnits: BusinessUnits[] = [];
  licenseCostCenters: BULicenceCostCenter[] = [];
  selectedLCCs: number[] = [];
  applications: BUCostCenterApplications[] = [];
  selectedApps: number[] = [];
  form: FormGroup;
  nodeStatusFilterForm: FormGroup;

  tabs = tabs;
  selectedTab = 0;
  selectedTabIndex = 0;
  selectedView = this.tabs[0].name;
  pageTitle: String = 'All Applications';
  hideInactive = false;
  hideUnconnected = false;
  viewTypes: UnityTopologyViewType[] = [];
  firstLoad: Boolean = false;
  // statusSummary: StatusSummary;
  activeSummary: StatusSummary;
  selectedNodeStatus: string = "all";

  constructor(private svc: ServiceTopologyService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.route.parent?.paramMap.subscribe((params: ParamMap) => {
      this.firstLoad = true;
      this.buId = params.get('businessId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBusinessUnits();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBusinessUnits() {
    this.businessUnits = [];
    this.svc.getBusinessUnits().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.businessUnits = data;
        this.getLicenseCostCenters(this.buId);
      } else {
        this.businessUnits = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.businessUnits = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Business Unit Data'));
    });
  }

  getLicenseCostCenters(buId: string) {
    this.licenseCostCenters = [];
    this.svc.getLisenceCostCenters(buId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.licenseCostCenters = data;
        this.selectedLCCs = [...this.licenseCostCenters.map(lcc => lcc.license_centre_id)];
        this.getApplications(buId, this.selectedLCCs);
      } else {
        this.licenseCostCenters = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.licenseCostCenters = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch License Cost Data'));
    });
  }

  getApplications(businessUnitId: string, costCenterIds: number[]) {
    this.applications = [];
    this.svc.getApplications(businessUnitId, costCenterIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.length > 0) {
        this.applications = data;
        this.selectedApps = this.applications.map(app => app.app_name_id);
        this.buildFilterForm();
      } else {
        this.applications = [];
        this.spinner.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.applications = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Application Data'));
    });
  }

  buildFilterForm() {
    this.form = this.svc.buildForm(this.buId);
    this.nodeStatusFilterForm = this.svc.buildNodeStatusFilterForm();
    // this.getWidgetsData();

    this.form.get('licenseCostCenter')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(lcc => {
      if (lcc === 'all') {
        this.selectedLCCs = this.licenseCostCenters.map(lcc => lcc.license_centre_id);
        // this.getWidgetsData();
      } else {
        this.selectedLCCs = [lcc];
      }
      this.onChangeLCCFilter();
    });

    this.form.get('application')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(app => {
      if (app === 'all') {
        this.selectedApps = this.applications.map(app => app.app_name_id);
      } else {
        this.selectedApps = [app];
      }
      // this.getWidgetsData();
    });

    this.nodeStatusFilterForm.get('nodeStatus')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.selectedNodeStatus = status;
    });

    this.spinner.stop('main');
  }

  async onChangeLCCFilter() {
    this.applications = await this.svc.getApplications(this.buId, this.selectedLCCs).toPromise();
    this.form.get('application')?.setValue('all', { emitEvent: true });
  }

  selectTab(i: number) {
    this.selectedTabIndex = i;
    this.selectedView = this.tabs[i].name;   // pass the tab value
  }

  handleStatusSummary(summary: StatusSummary) {
    this.activeSummary = summary;
    // Now you can bind this to your legends or anywhere in parent
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}

export const tabs = [
  { label: 'App Services', name: 'service' },
  { label: 'App Components', name: 'component' },
  { label: 'App Processes', name: 'process' },
  { label: 'Data Messaging Services', name: 'database' },
  { label: 'Host', name: 'host' },
  { label: 'Physical & Cloud Infrastructure', name: 'physical_layer' }
];
