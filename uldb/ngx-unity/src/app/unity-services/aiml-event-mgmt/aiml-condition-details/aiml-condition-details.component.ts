import { Component, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { AIMLConditionDetailsViewData, AimlConditionDetailsService } from './aiml-condition-details.service';
import { AimlEventDetailsService } from '../../../shared/aiml-event-details/aiml-event-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'aiml-condition-details',
  templateUrl: './aiml-condition-details.component.html',
  styleUrls: ['./aiml-condition-details.component.scss']
})
export class AimlConditionDetailsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  conditionId: string;
  view: AIMLConditionDetailsViewData;
  showConditionDetailsTable = false;
  showConditionAlertTimeline = false;

  constructor(private conditionDetailService: AimlConditionDetailsService,
    private eventDetailService: AimlEventDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private renderer: Renderer2,
    private refreshService: DataRefreshBtnService,) {
    this.conditionDetailService.conditionDetailsAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(conditionId => {
      this.showConditionDetailsTable = false;
      this.showConditionAlertTimeline = false;
      this.conditionId = conditionId;
      this.getConditionDetails(conditionId);
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.closeConditionDetails();
    });
  }

  ngOnInit(): void {
  }

  getConditionDetails(conditionId: string) {
    this.spinner.start('main');
    this.conditionDetailService.getConditionDetails(conditionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.view = this.conditionDetailService.convertToViewdata(res);
      this.renderer.setStyle(document.getElementById('conditionDetailsTemplate'), "width", '40%');
      this.handleLoadTime();
    }, err => {
      this.notification.error(new Notification('Failed to fetch alert details. Please try again later.'));
      this.spinner.stop('main');
    });
  }

  handleLoadTime() {
    setTimeout(() => {
      this.showConditionDetailsTable = true;
      setTimeout(() => {
        let totalColumnWidth = document.getElementById('condition-events-timeline').clientWidth - 100;
        this.view.alerts.map((al) => {
          let lengthFor1MS = totalColumnWidth / al.totalTimeBetweenEvents;
          al.events.map((ev, index) => {
            if (index != al.events.length - 1) {
              al.events[index].severityBorderLength = lengthFor1MS * (al.events[index + 1].diffBwfirstAndCurrentEventTime - al.events[index].diffBwfirstAndCurrentEventTime);
            } else {
              if (index == 0) {
                al.events[index].severityBorderLength = totalColumnWidth - 10;
              } else {
                al.events[index].severityBorderLength = 0;
              }
            }
          })
        })
        this.showConditionAlertTimeline = true;
      }, 0)
    }, 1000)
  }

  closeConditionDetails() {
    this.eventDetailService.closeEventDetails();
    this.renderer.setStyle(document.getElementById('conditionDetailsTemplate'), "width", '0%');
    this.showConditionDetailsTable = false;
    this.showConditionAlertTimeline = false;
  }

  viewEventDetails(eventId: string, alertId: string) {
    this.eventDetailService.showEventDetails(eventId, alertId, true);
  }
}
