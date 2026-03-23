import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AwsInstanceViewData, UsiEventIngestionAwsService } from './usi-event-ingestion-aws.service';
import { TabData } from 'src/app/shared/tabdata';
import { Subject } from 'rxjs';
import { UsiEventIngestionAwsCrudService } from './usi-event-ingestion-aws-crud/usi-event-ingestion-aws-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-event-ingestion-aws',
  templateUrl: './usi-event-ingestion-aws.component.html',
  styleUrls: ['./usi-event-ingestion-aws.component.scss'],
  providers: [UsiEventIngestionAwsService]
})
export class UsiEventIngestionAwsComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'AWS Event Ingestion',
    url: '/setup/integration/aws'
  }];

  private ngUnsubscribe = new Subject();
  viewData: AwsInstanceViewData[] = [];
  webhookUrl: string;

  constructor(private crudService: UsiEventIngestionAwsCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private awsService: UsiEventIngestionAwsService,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute) { }

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
    this.awsService.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.awsService.convertToViewData(data);
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

  switchStatus(data: AwsInstanceViewData) {
    this.spinner.start('main');
    if (data.enabled) {
      this.awsService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('AWS Instance disabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable instance. Please try again later.'));
      });
    } else {
      this.awsService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('AWS Instance enabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable instance. Please try again later.'));
      });
    }
  }

  editInstance(data: AwsInstanceViewData) {
    this.crudService.addOrEdit(data.uuid);
  }

  deleteInstance(data: AwsInstanceViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKey(data: AwsInstanceViewData) {
    try {
      navigator.clipboard.writeText(data.token)
        .then(() => {
          this.notification.success(new Notification('Key copied to clipboard.'));
        })
    } catch (err) {
      this.notification.error(new Notification('Failed to copy key. Please try again later.'));
    }
  }

  subscribeUrl(data: AwsInstanceViewData) {
    try {
      navigator.clipboard.writeText(data.subscribeUrl)
        .then(() => {
          this.notification.success(new Notification('Subscribe url copied to clipboard'));
        })
    } catch (err) {
      this.notification.error(new Notification('Failed to copy subscribe url. Please try again later.'));
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
