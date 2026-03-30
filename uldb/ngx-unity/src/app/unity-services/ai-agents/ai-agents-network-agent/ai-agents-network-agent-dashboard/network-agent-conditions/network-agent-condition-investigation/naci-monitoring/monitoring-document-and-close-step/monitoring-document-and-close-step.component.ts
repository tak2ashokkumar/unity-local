import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { DocumentAndCloseDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'monitoring-document-and-close-step',
  templateUrl: './monitoring-document-and-close-step.component.html',
  styleUrls: ['./monitoring-document-and-close-step.component.scss']
})
export class MonitoringDocumentAndCloseStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: NetworkAgentsChatResponseType;
  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: DocumentAndCloseDataType;

  constructor(private monitoringSvc: NaciMonitoringService) {
    this.monitoringSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.documentAndCloseOpen = StepName == 'documentAndClose' ? !this.documentAndCloseOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 5') {
      return;
    }
    this.toggleDocumentAndClose();
    this.documentAndCloseViewData = this.chatResponse?.answer?.data as DocumentAndCloseDataType;
  }

  toggleDocumentAndClose() {
    this.monitoringSvc.toggle('documentAndClose');
  }

}
