import { ScrollStrategy } from '@angular/cdk/overlay';
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
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { DatabaseType } from 'src/app/united-cloud/shared/entities/database-servers.type';
import { DatabaseDetailsService } from './database-details.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'database-details',
  templateUrl: './database-details.component.html',
  styleUrls: ['./database-details.component.scss'],
  providers: [DatabaseDetailsService]
})
export class DatabaseDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entityId: string;
  scrollStrategy: ScrollStrategy;
  view: DatabaseType;
  device: DeviceTabData;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;

  serverForm: FormGroup;

  nonFieldErr: string = '';
  now: any;

  constructor(private detailService: DatabaseDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.entityId = params.get('entityId');
      if (this.entityId) {
        this.spinner.start('main');
        this.getDeviceDetails();
        this.getServerData();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('db-device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.entityId;
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDeviceDetails();
    this.getServerData();
  }

  async getDeviceDetails() {
    this.detailService.getDeviceDetails(this.entityId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
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

  getServerData() {
    this.spinner.start('serverSpinner');
    this.detailService.getServerData(this.entityId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.serverForm = this.detailService.buildServerForm(res);
      this.spinner.stop('serverSpinner');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Failed to get Server details"));
      this.spinner.stop('serverSpinner');
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}