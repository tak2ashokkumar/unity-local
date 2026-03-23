import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { AiObservabilityVectorDbServiceDetailsService } from './ai-observability-vector-db-service-details.service';

@Component({
  selector: 'ai-observability-vector-db-service-details',
  templateUrl: './ai-observability-vector-db-service-details.component.html',
  styleUrls: ['./ai-observability-vector-db-service-details.component.scss'],
  providers: [AiObservabilityVectorDbServiceDetailsService]
})
export class AiObservabilityVectorDbServiceDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  scrollStrategy: ScrollStrategy;

  view: any;
  device: DeviceTabData;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  nonFieldErr: string = '';
  constructor(private svc: AiObservabilityVectorDbServiceDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private readonly sso: ScrollStrategyOptions,
    private storageService: StorageService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('Id');
      if (this.deviceId) {
        this.spinner.start('main');
        this.getDeviceDetails();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDeviceDetails();
  }

  getDeviceDetails() {
    this.svc.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.storageService.put('device', { name: res.name, deviceType: DeviceMapping.VECTOR_DB_SERVICE, configured: true }, StorageType.SESSIONSTORAGE);
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildForm(_clone(this.view));
    this.detailFormErrors = this.svc.resetFormErrors();
    this.detailFormValidationMessages = this.svc.formValidationMessages;
    this.spinner.stop('main');
  }

}
