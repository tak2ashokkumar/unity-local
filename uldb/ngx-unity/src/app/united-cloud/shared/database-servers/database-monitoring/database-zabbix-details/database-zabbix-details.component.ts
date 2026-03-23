import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScrollStrategy } from '@angular/cdk/overlay';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { DatabaseZabbixDetailsService } from './database-zabbix-details.service';
import { DatabaseServer } from '../../../entities/database-servers.type';
import { LifeCycleStageOptions, LifeCycleStageStatusOptions } from '../../../hypervisors/hypervisors-crud/hypervisors-crud.service';

@Component({
  selector: 'database-zabbix-details',
  templateUrl: './database-zabbix-details.component.html',
  styleUrls: ['./database-zabbix-details.component.scss'],
  providers: [DatabaseZabbixDetailsService]
})
export class DatabaseZabbixDetailsComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  scrollStrategy: ScrollStrategy;
  view: DatabaseServer;
  device: DeviceTabData;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  
  nonFieldErr: string = '';
  now: any;

  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;

  constructor(private detailService: DatabaseZabbixDetailsService,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private storageService: StorageService,
    private router: Router,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        this.spinner.start('main');
        this.getDeviceDetails();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    // this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.deviceId }] };
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDeviceDetails();
  }

  async getDeviceDetails() {
    this.detailService.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.storageService.put('device', { name: res.db_instance_name, deviceType: DeviceMapping.DB_SERVER, configured: res.monitoring.configured }, StorageType.SESSIONSTORAGE);
      this.buildDetailForm();
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildDetailForm() {
    this.detailForm = this.detailService.buildDetailForm(_clone(this.view));    
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.detailFormValidationMessages = this.detailService.detailFormValidationMessages;
    this.detailForm.disable({ emitEvent: false });
    this.spinner.stop('main');
  }

}