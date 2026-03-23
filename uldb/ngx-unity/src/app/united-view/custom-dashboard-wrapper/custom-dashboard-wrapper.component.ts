import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { CustomDashboardWidgetCrudService } from './custom-dashboard-widget-crud/custom-dashboard-widget.service';
import { CustomDashboardWrapperService } from './custom-dashboard-wrapper.service';
import { CustomDashboardWidgetType } from './custom-dashboard.type';

@Component({
  selector: 'custom-dashboard-wrapper',
  templateUrl: './custom-dashboard-wrapper.component.html',
  styleUrls: ['./custom-dashboard-wrapper.component.scss'],
  providers: [CustomDashboardWrapperService]
})
export class CustomDashboardWrapperComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: CustomDashboardWidgetType[] = [];
  duration: number = 1;

  constructor(private crudSvc: CustomDashboardWidgetCrudService,
    private wrapperSvc: CustomDashboardWrapperService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getWidgets();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData($event: number) {
    this.spinner.start('main');
    this.getWidgets();
  }

  durationChanged() {
    this.spinner.start('main');
    this.getWidgets();
  }

  onCrud(event: CRUDActionTypes) {
    this.getWidgets();
  }

  getWidgets() {
    this.wrapperSvc.getWidgets(this.duration).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = <any>res;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching widgets!!Please try again.'))
    });
  }

  createWidget() {
    this.crudSvc.addOrEdit(null);
  }

}
