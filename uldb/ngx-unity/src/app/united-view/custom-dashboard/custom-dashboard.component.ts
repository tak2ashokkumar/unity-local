import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CustomDashboardService } from './custom-dashboard.service';
import { GRAPH_WIDGET_CLASS, WidgetDataType } from './custom-dashboard.type';

@Component({
  selector: 'custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss'],
  providers: [CustomDashboardService]
})
export class CustomDashboardComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  viewData: WidgetDataType[] = [];
  duration: number = 1;
  isLoading: boolean = false;
  refreshForm: FormGroup;

  constructor(private spinner: AppSpinnerService,
    private svc: CustomDashboardService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getWidgets();
    this.syncWidgets();
    this.autoRefresh();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData($event: number) {
    this.spinner.start('main');
    this.getWidgets();
  }

  autoRefresh() {
    this.refreshForm = this.svc.buildAutoRefresh();
    this.refreshForm.get('autoRefresh').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(autoRefresh => {
      if (autoRefresh) {
        this.refreshForm.get('refreshInterval').enable();
      } else {
        this.refreshForm.get('refreshInterval').disable();
      }
    });
    this.refreshForm.valueChanges.pipe(switchMap(({ autoRefresh, refreshInterval }) => {
      if (autoRefresh) {
        return timer(0, refreshInterval * 60000).pipe(takeUntil(this.ngUnsubscribe));
      }
    })
    ).subscribe(() => {
      this.getWidgets();
    });
  }

  durationChanged() {
    this.spinner.start('main');
    this.getWidgets();
  }

  syncWidgets() {
    this.svc.syncWidgets().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.result.data) {
        this.getWidgets();
      }
    }, (err: HttpErrorResponse) => {
      // this.notification.error(new Notification(err.error));
    });
  }

  getWidgets() {
    this.svc.getWidgets(this.duration).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = res;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching widgets!!Please try again.'))
    });
  }

  getColWidth(view: WidgetDataType) {
    if (view.widget_type == 'metrices') {
      if(view?.filter_by == 'metric'){
        return 'col-4';
      }
      if (view.period == 'last' || view.metrics_network_data == 'bandwidth' || view.network_group_by != 'devices') {
        return 'col-6';
      } else {
        return 'col-4';
      }
    } else {
      if (view.widget_type == 'alerts' || view.widget_type == 'device_by_os' || view.widget_type == 'infra_summary' ||
        (view.widget_type == 'cloud' && (view.group_by == 'tags' || view.group_by == 'cloud_type')) ||
        (view.widget_type == 'cloud_cost' && (view.group_by == 'account_name' || view.group_by == 'cloud_type')) ||
        view.widget_type == 'sustainability') {
        if (view.data.length > 36) {
          return 'col-8';
        } else if (view.data.length > 12) {
          return 'col-6';
        }
        return 'col-4';
      } else if ((view.widget_type == 'cloud' &&
        (view.group_by == 'locations' || view.group_by == 'regions' || view.group_by == 'resource_types')) ||
        (view.widget_type == 'cloud' && (view.group_by == 'regions' || view.group_by == 'service'))) {
        return 'col-4';
      } else if (view.widget_type == 'host_availability' && view.group_by != 'status') {
        return 'col-6';
      } else if (view.widget_type == 'host_availability' && view.group_by == 'status') {
        return 'col-4';
      }
      let obj = GRAPH_WIDGET_CLASS[view.widget_type]
      return obj[view.group_by];
    }
  }

  addWidget() {
    this.router.navigate(['widget/add'], { relativeTo: this.route });
  }

  manageWidget() {
    this.router.navigate(['widgets'], { relativeTo: this.route });
  }
}
