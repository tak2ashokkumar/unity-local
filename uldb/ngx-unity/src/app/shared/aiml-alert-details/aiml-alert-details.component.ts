import { Component, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AimlEventDetailsService } from '../aiml-event-details/aiml-event-details.service';
import { AIMLAlertDetailsViewData, AimlAlertDetailsService } from './aiml-alert-details.service';

@Component({
  selector: 'aiml-alert-details',
  templateUrl: './aiml-alert-details.component.html',
  styleUrls: ['./aiml-alert-details.component.scss'],
  providers: []
})
export class AimlAlertDetailsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  alertId: string;
  view: AIMLAlertDetailsViewData;
  showAlertDetailsTable = false;
  showAlertsEventTimeline = false;

  constructor(private alertDetailService: AimlAlertDetailsService,
    private eventDetailService: AimlEventDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private renderer: Renderer2,
    private refreshService: DataRefreshBtnService,) {
    this.alertDetailService.alertDetailsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(alertId => {
      this.showAlertDetailsTable = false;
      this.showAlertsEventTimeline = false;
      this.alertId = alertId;
      this.getAlertDetails(alertId);
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.closeAlertDetails();
    });
  }

  ngOnInit(): void {
  }

  getAlertDetails(alertId: string) {
    this.spinner.start('main');
    this.alertDetailService.getAlertDetails(alertId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.view = this.alertDetailService.convertToAlertDetailsViewData(res);
      this.getAlertsTimeline(alertId, res.first_event_datetime);
      this.renderer.setStyle(document.getElementById('alertDetailsTemplate'), "width", '40%');
    }, err => {
      this.notification.error(new Notification('Failed to fetch alert details. Please try again later.'));
      this.spinner.stop('main');
    });
  }

  getAlertsTimeline(alertId: string, firstEventDateTime: string) {
    this.alertDetailService.getAlertsTimeline(alertId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.view.events = this.alertDetailService.convertToAlertEventsTimelineViewData(res, firstEventDateTime);
      this.handleLoadTime();
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts Timeline.'));
    });
  }

  handleLoadTime() {
    setTimeout(() => {
      this.showAlertDetailsTable = true;
      setTimeout(() => {
        let totalColumnWidth = document.getElementById('alert-events-timeline').clientWidth - 50;
        let lengthFor1MS = totalColumnWidth / this.view.totalTimeBetweenEvents;
        this.view.events.map((ev, index) => {
          if (index != this.view.events.length - 1) {
            this.view.events[index].severityBorderLength = lengthFor1MS * (this.view.events[index + 1].diffBwfirstAndCurrentEventTime - this.view.events[index].diffBwfirstAndCurrentEventTime);
          } else {
            if (index == 0) {
              this.view.events[index].severityBorderLength = totalColumnWidth - 10;
            } else {
              this.view.events[index].severityBorderLength = 0;
            }
          }
        })
        this.showAlertsEventTimeline = true;
      }, 0)
    }, 1000);
  }

  closeAlertDetails() {
    this.eventDetailService.closeEventDetails();
    this.renderer.setStyle(document.getElementById('alertDetailsTemplate'), "width", '0%');
    this.showAlertDetailsTable = false;
    this.showAlertsEventTimeline = false;
  }

  viewEventDetails(eventId: string, alertId: string) {
    this.eventDetailService.showEventDetails(eventId, alertId, true);
  }
}
