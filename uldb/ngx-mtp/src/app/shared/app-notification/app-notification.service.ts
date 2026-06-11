import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { NotificationType, Notification } from './notification.type';
@Injectable({
  providedIn: 'root'
})
export class AppNotificationService {

  constructor() { }

  private notificationAnnouncedSource = new Subject<Notification>();
  notificationAnnounced$: Observable<Notification> = this.notificationAnnouncedSource.asObservable();

  private notify(notification: Notification) {
    this.notificationAnnouncedSource.next(notification);
  }
  success(notification: Notification) {
    notification.type = NotificationType.SUCCESS;
    this.notify(notification);
  }
  error(notification: Notification) {
    notification.type = NotificationType.ERROR;
    this.notify(notification);
  }

  warning(notification: Notification) {
    notification.type = NotificationType.WARNING;
    this.notify(notification);
  }
}
