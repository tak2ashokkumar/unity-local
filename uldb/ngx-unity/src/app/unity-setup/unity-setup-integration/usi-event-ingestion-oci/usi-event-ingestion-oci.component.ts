import { Component, OnInit } from '@angular/core';
import { OciInstanceViewData, UsiEventIngestionOciService } from './usi-event-ingestion-oci.service';
import { TabData } from 'src/app/shared/tabdata';
import { Subject } from 'rxjs';
import { UsiEventIngestionOciCrudService } from './usi-event-ingestion-oci-crud/usi-event-ingestion-oci-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-event-ingestion-oci',
  templateUrl: './usi-event-ingestion-oci.component.html',
  styleUrls: ['./usi-event-ingestion-oci.component.scss'],
  providers: [UsiEventIngestionOciService]
})
export class UsiEventIngestionOciComponent implements OnInit {

  public tabItems: TabData[] = [{
    name: 'Oci Event Ingestion',
    url: '/setup/integration/oci'
  }];

  private ngUnsubscribe = new Subject();
  viewData: OciInstanceViewData[] = [];
  webhookUrl: string;

  constructor(private crudService: UsiEventIngestionOciCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ociService: UsiEventIngestionOciService,
    private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
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
    this.ociService.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.ociService.convertToViewData(data);
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

  switchStatus(data: OciInstanceViewData) {
    this.spinner.start('main');
    if (data.enabled) {
      this.ociService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('OCI Instance disabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable instance. Please try again later.'));
      });
    } else {
      this.ociService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('OCI Instance enabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable instance. Please try again later.'));
      });
    }
  }

  editInstance(data: OciInstanceViewData) {
    this.crudService.addOrEdit(data.uuid);
  }

  deleteInstance(data: OciInstanceViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKey(data: OciInstanceViewData) {
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
