import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppNotificationService } from './app-notification.service';
import { NotificationType, Notification } from './notification.type';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './app-notification.component.html',
  styleUrls: ['./app-notification.component.scss']
})
export class AppNotificationComponent implements OnInit, OnDestroy {

  alerts: Notification[] = [];
  private ngUnsubscribe = new Subject();
  constructor(private notificationService: AppNotificationService,
    private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.alerts = this.alerts.filter(a => (a.type == NotificationType.SUCCESS || a.type == NotificationType.WARNING));
      }
    });
  }

  ngOnInit() {
    this.notificationService.notificationAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((notification: Notification) => {
      notification.type == NotificationType.ERROR ? notification.timeout = null : notification.timeout = 5000;
      this.alerts.push(notification);
    });
  }

  onClosed(index: number): void {
    this.alerts.splice(index, 1);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}