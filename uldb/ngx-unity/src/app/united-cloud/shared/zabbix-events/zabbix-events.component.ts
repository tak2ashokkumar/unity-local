import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { UnitedCloudSharedService } from '../united-cloud-shared.service';
import { ZabbixEventsService, ZabbixMonitoringEventsViewdata } from './zabbix-events.service';

/* 
  ------------Common Component for Events Monitoring---------.
  This component has been used in:
  - Switches, Firewalls, Load Balancer, Hypervisors, BMS, Mac mini, VMs, Storage, Other Devices, PDUs
  - AWS, Azure, GCP, Containers/Dockers, Nutanix

  It calls the "monitoring/events" API based on the device type and device ID and displays the data on the Events page.

  ------------Components---------
  zabbix-dc-pdu, aws-zabbix, azure-zabbix, bm-servers-zabbix, container-controllers-zabbix,
  docker-containers-zabbix, firewalls-zabbix, gcp-zabbix, hypervisors-zabbix, loadbalancers-zabbix,
  macmini-zabbix, nutanix-zabbix, otherdevices-zabbix, storage-Zabbix, switches-zabbix, vms-zabbix,
  sdwan-details-zabbix, sdwan-zabbix

  -------------TBD-----------------
  database-zabbix (blocked)
*/

@Component({
  selector: 'zabbix-events',
  templateUrl: './zabbix-events.component.html',
  styleUrls: ['./zabbix-events.component.scss'],
  providers: [ZabbixEventsService]
})

export class ZabbixEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  device: DeviceTabData;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: ZabbixMonitoringEventsViewdata[] = [];
  selectedViewIndex: number;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;
  onPrivateCloudAllDevices: boolean = false;
  isSpinnerLoading: boolean = false;

  constructor(private alertService: ZabbixEventsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private cloudSharedService: UnitedCloudSharedService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private router: Router,
    @Optional() public bsModalRef?: BsModalRef) {
    this.onPrivateCloudAllDevices = this.router.url.includes('alldevices') ? true : false;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: 10 };
    this.onPrivateCloudAllDevices || this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.onPrivateCloudAllDevices || this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.onPrivateCloudAllDevices || (this.device.uuid = this.deviceId ? this.deviceId : this.pcId);
    setTimeout(() => {
      this.getEvents();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.router.url.includes('alldevices')) {
      this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
    }
  }

  refreshData() {
    this.getEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchQuery = event;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getEvents();
  }

  getEvents(skipSpinnerStart?: boolean) {
    if (!skipSpinnerStart) {
      this.spinner.start('main');
    }
    this.isSpinnerLoading = true;
    this.cloudSharedService.getZabbixEventsByDeviceTypeAndDeviceId(this.device.deviceType, this.device.uuid, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.alertService.convertEventDetailsToViewdata(res.results);
      this.spinner.stop('main');
      this.isSpinnerLoading = false;
    }, (err: HttpErrorResponse) => {
      this.onPrivateCloudAllDevices && this.bsModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch events. Please try again later.'));
    });
  }

  acknowledge(index: number) {
    this.selectedViewIndex = index;
    this.acknowledgeForm = this.alertService.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.alertService.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.alertService.acknowledgeFormValidationMessages;
  }

  onAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      let selectedIndex = _clone(this.selectedViewIndex);
      this.onCloseAcknowledge();
      this.viewData[selectedIndex].isAcknowledged = true;
      this.alertService.onAcknowledge(this.viewData[selectedIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[selectedIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[selectedIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[selectedIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[selectedIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[selectedIndex].acknowledgedTooltipMsg = `Acknowledged by ${res.acknowledged_by} at ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[selectedIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an event'));
      });
    }
  }

  onCloseAcknowledge() {
    this.selectedViewIndex = null;
    let element: HTMLElement = document.getElementById('count') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.alertService.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.alertService.acknowledgeFormValidationMessages;
  }

  disable(view: ZabbixMonitoringEventsViewdata) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.alertService.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents(true);
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolve(view: ZabbixMonitoringEventsViewdata) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.alertService.resolve(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents(true);
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }
}
