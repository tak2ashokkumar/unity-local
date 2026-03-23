import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardDockersControllerService, DashboardDockersControllersViewData } from './dashboard-dockers-controller.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'dashboard-dockers-controller',
  templateUrl: './dashboard-dockers-controller.component.html',
  styleUrls: ['./dashboard-dockers-controller.component.scss'],
  providers: [DashboardDockersControllerService]
})
export class DashboardDockersControllerComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  dockerControllers: DashboardDockersControllersViewData = new DashboardDockersControllersViewData();

  constructor(private dockersControllerService: DashboardDockersControllerService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getDockersControllers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDockersControllers() {
    this.dockersControllerService.getDockersControllers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.dockerControllers = this.dockersControllerService.convertToViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching Docker Controllers. Please try again.'));
    });
  }

}
