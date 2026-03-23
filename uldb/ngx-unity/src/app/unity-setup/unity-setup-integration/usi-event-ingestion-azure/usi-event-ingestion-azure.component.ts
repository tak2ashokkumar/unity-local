import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { UsiEventIngestionAzureCrudService } from './usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.service';
import { AzureInstanceViewData, UsiEventIngestionAzureService } from './usi-event-ingestion-azure.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-event-ingestion-azure',
  templateUrl: './usi-event-ingestion-azure.component.html',
  styleUrls: ['./usi-event-ingestion-azure.component.scss'],
  providers: [UsiEventIngestionAzureService]
})
export class UsiEventIngestionAzureComponent implements OnInit {

  public tabItems: TabData[] = [{
    name: 'Azure Event Ingestion',
    url: '/setup/integration/azure'
  }];

  private ngUnsubscribe = new Subject();
  viewData: AzureInstanceViewData[] = [];
  webhookUrl: string;

  constructor(private crudService: UsiEventIngestionAzureCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private azureService: UsiEventIngestionAzureService,
    private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getInstanceData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getInstanceData();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinner.start('main');
    this.getInstanceData();
  }

  getInstanceData() {
    this.azureService.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.azureService.convertToViewData(data);
      if (this.viewData.length) {
        this.webhookUrl = this.viewData[0].typeUrl;
      } else {
        this.webhookUrl = null;
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.webhookUrl = null;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Instances'));
    });
  }

  addInstance() {
    this.crudService.addOrEdit(null);
  }

  switchStatus(data: AzureInstanceViewData) {
    this.spinner.start('main');
    if (data.enabled) {
      this.azureService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Azure Instance disabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable instance. Please try again later.'));
      });
    } else {
      this.azureService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Azure Instance enabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable instance. Please try again later.'));
      });
    }
  }

  editInstance(data: AzureInstanceViewData) {
    this.crudService.addOrEdit(data.uuid);
  }

  deleteInstance(data: AzureInstanceViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKey(data: AzureInstanceViewData) {
    try {
      navigator.clipboard.writeText(data.token)
        .then(() => {
          this.notification.success(new Notification('Key copied to clipboard.'));
        })
    } catch (err) {
      this.notification.error(new Notification('Failed to copy key. Please try again later.'));
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
