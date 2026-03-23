import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DashboardKubernetesControllersService, DashboardKubernetesControllersViewData } from './dashboard-kubernetes-controllers.service';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'dashboard-kubernetes-controllers',
  templateUrl: './dashboard-kubernetes-controllers.component.html',
  styleUrls: ['./dashboard-kubernetes-controllers.component.scss'],
  providers: [DashboardKubernetesControllersService]
})
export class DashboardKubernetesControllersComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  kubernetesControllers: DashboardKubernetesControllersViewData[] = [];
  constructor(private kubernetesControllerService: DashboardKubernetesControllersService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getKubernetesControllers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getKubernetesControllers() {
    this.kubernetesControllerService.getKubernetesControllers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.kubernetesControllers = this.kubernetesControllerService.convertToViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching kubernetes controllers. Please try again.'));
    });
  }

}
