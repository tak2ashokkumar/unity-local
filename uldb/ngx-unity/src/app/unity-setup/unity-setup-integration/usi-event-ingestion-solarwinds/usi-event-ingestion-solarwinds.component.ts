import { Component, OnInit } from '@angular/core';
import { SolarwindsInstanceViewData, UsiEventIngestionSolarwindsService } from './usi-event-ingestion-solarwinds.service';
import { TabData } from 'src/app/shared/tabdata';
import { Subject } from 'rxjs';
import { UsiEventIngestionSolarwindsCrudService } from './usi-event-ingestion-solarwinds-crud/usi-event-ingestion-solarwinds-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usi-event-ingestion-solarwinds',
  templateUrl: './usi-event-ingestion-solarwinds.component.html',
  styleUrls: ['./usi-event-ingestion-solarwinds.component.scss'],
  providers: [UsiEventIngestionSolarwindsService]
})
export class UsiEventIngestionSolarwindsComponent implements OnInit {

  public tabItems: TabData[] = [{
    name: 'SolarWinds Event Ingestion',
    url: '/setup/integration/solarwinds'
  }];

  private ngUnsubscribe = new Subject();
  viewData: SolarwindsInstanceViewData[] = [];

  constructor(private crudService: UsiEventIngestionSolarwindsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private solarwindsService: UsiEventIngestionSolarwindsService) { }

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
    this.solarwindsService.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.solarwindsService.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Instances'));
    });
  }

  addInstance() {
    this.crudService.addOrEdit(null);
  }

  switchStatus(data: SolarwindsInstanceViewData) {
    this.spinner.start('main');
    if (data.enabled) {
      this.solarwindsService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Solarwinds Instance disabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable instance. Please try again later.'));
      });
    } else {
      this.solarwindsService.toggleInstance(data.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Solarwinds Instance enabled successfully.'));
        this.getInstanceData();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable instance. Please try again later.'));
      });
    }
  }

  editInstance(data: SolarwindsInstanceViewData) {
    this.crudService.addOrEdit(data.uuid);
  }

  deleteInstance(data: SolarwindsInstanceViewData) {
    this.crudService.delete(data.uuid);
  }

  copyKey(data: SolarwindsInstanceViewData) {
    try {
      navigator.clipboard.writeText(data.token)
        .then(() => {
          this.notification.success(new Notification('Key copied to clipboard.'));
        })
    } catch (err) {
      this.notification.error(new Notification('Failed to copy key. Please try again later.'));
    }
  }

  goToSettings(source?: string) {
    const queryParams = { source: '300' };
    this.router.navigate(['services/aiml/rules/solarwinds'], { queryParams });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
