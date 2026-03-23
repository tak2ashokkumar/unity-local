import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { GcpInstanceViewData, UsiEventIngestionGcpService } from './usi-event-ingestion-gcp.service';
import { UsiEventIngestionGcpCrudService } from './usi-event-ingestion-gcp-crud/usi-event-ingestion-gcp-crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-event-ingestion-gcp',
  templateUrl: './usi-event-ingestion-gcp.component.html',
  styleUrls: ['./usi-event-ingestion-gcp.component.scss'],
  providers: [UsiEventIngestionGcpService]
})
export class UsiEventIngestionGcpComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'GCP Event Ingestion',
    url: '/setup/integration/gcp'
  }];

  private ngUnsubscribe = new Subject();
  viewData: GcpInstanceViewData[] = [];
  webhookUrl: string;

  constructor(private crudService: UsiEventIngestionGcpCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private gcpService: UsiEventIngestionGcpService,
    private renderer: Renderer2,
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

  refreshData(){
    this.spinner.start('main');
    this.getInstanceData();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinner.start('main');
    this.getInstanceData();
  }

  getInstanceData() {
    this.gcpService.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.gcpService.convertToViewData(data);
      if(this.viewData.length){
        this.webhookUrl = this.viewData[0].typeUrl;
      } else{
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

  switchStatus(data: GcpInstanceViewData) {
    this.spinner.start('main');
    if (data.enabled) {
      this.gcpService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('GCP Instance disabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable instance. Please try again later.'));
      });
    } else {
      this.gcpService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('GCP Instance enabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable instance. Please try again later.'));
      });
    }
  }

  editInstance(data: GcpInstanceViewData) {
    this.crudService.addOrEdit(data.uuid);
  }

  deleteInstance(data: GcpInstanceViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKey(data: GcpInstanceViewData) {
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
