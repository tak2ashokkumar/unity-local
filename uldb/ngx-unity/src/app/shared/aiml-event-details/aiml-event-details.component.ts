import { Component, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { AIMLEventDetailsViewData, AimlEventDetailsService } from './aiml-event-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'aiml-event-details',
  templateUrl: './aiml-event-details.component.html',
  styleUrls: ['./aiml-event-details.component.scss']
})
export class AimlEventDetailsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  alertId: string;
  eventId: string;
  isSubDetails: boolean = false;

  view: AIMLEventDetailsViewData;
  showEventDetailsTable = false;
  showEventDetailsTimeline = false;

  constructor(private detailService: AimlEventDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private renderer: Renderer2,
    private refreshService: DataRefreshBtnService,) {
    this.detailService.eventDetailsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.showEventDetailsTable = false;
      this.showEventDetailsTimeline = false;
      this.alertId = params.alertId;
      this.eventId = params.eventId;
      this.isSubDetails = params.isSubDetails;
      this.manageEventDetails();
    });

    this.detailService.closeEventDetailsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.closeEventDetails();
    });

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.closeEventDetails();
    });
  }

  ngOnInit(): void {
  }

  manageEventDetails() {
    if (this.alertId && this.isSubDetails) {
      this.getSubEventDetails();
    } else {
      this.getPrimeEventDetails();
    }
  }

  getPrimeEventDetails() {
    this.spinner.start('main');
    this.detailService.getEventDetails(this.eventId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.view = this.detailService.convertToEventDetailsViewdata(res);
      this.renderer.setStyle(document.getElementById('eventDetailsTemplate'), "width", '40%');
      this.renderer.setStyle(document.getElementById('event-details-card'), "min-height", '100%');
    }, err => {
      this.notification.error(new Notification('Failed to fetch event details. Please try again later.'));
      this.spinner.stop('main');
    });
  }

  getSubEventDetails() {
    this.detailService.getEventDetails(this.eventId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = this.detailService.convertToEventDetailsViewdata(res);
      this.renderer.setStyle(document.getElementById('eventDetailsTemplate'), "left", '45%');
      this.renderer.setStyle(document.getElementById('eventDetailsTemplate'), "width", '35%');
      this.renderer.removeStyle(document.getElementById('event-details-card'), "min-height");
      this.handleLoadTime();
      this.getAlertDetails();
    }, err => {
      this.notification.error(new Notification('Failed to fetch event details. Please try again later.'));
    });
  }

  getAlertDetails() {
    this.detailService.getAlertDetails(this.alertId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.view.alert = this.detailService.convertToAlertDetailsViewData(res);
      this.getAlertsTimeline(res.first_event_datetime)
    }, err => {
      this.notification.error(new Notification('Failed to fetch timeline details. Please try again later.'));
    });
  }

  getAlertsTimeline(firstEventDateTime: string) {
    this.detailService.getAlertsTimeline(this.alertId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.view.alert.events = this.detailService.convertToAlertsTimelineViewData(res, firstEventDateTime);
      this.handleLoadTime();
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts Timeline.'));
    });
  }

  handleLoadTime() {
    setTimeout(() => {
      this.showEventDetailsTable = true;
      setTimeout(() => {
        let totalColumnWidth = document.getElementById('event-details-timeline').clientWidth - 50;
        let lengthFor1MS = totalColumnWidth / this.view.alert.totalTimeBetweenEvents;
        this.view.alert.events.map((ev, index) => {
          if (index != this.view.alert.events.length - 1) {
            this.view.alert.events[index].severityBorderLength = lengthFor1MS * (this.view.alert.events[index + 1].diffBwfirstAndCurrentEventTime - this.view.alert.events[index].diffBwfirstAndCurrentEventTime);
          } else {
            if (index == 0) {
              this.view.alert.events[index].severityBorderLength = totalColumnWidth - 10;
            } else {
              this.view.alert.events[index].severityBorderLength = 0;
            }
          }
        })
        this.showEventDetailsTimeline = true;
      }, 0)
    }, 1000)
  }

  closeEventDetails() {
    this.showEventDetailsTable = false;
    this.showEventDetailsTimeline = false;
    // this.renderer.setStyle(document.getElementById('eventDetailsTemplate'), "left", '0%');
    this.renderer.setStyle(document.getElementById('eventDetailsTemplate'), "width", '0%');
  }
}
