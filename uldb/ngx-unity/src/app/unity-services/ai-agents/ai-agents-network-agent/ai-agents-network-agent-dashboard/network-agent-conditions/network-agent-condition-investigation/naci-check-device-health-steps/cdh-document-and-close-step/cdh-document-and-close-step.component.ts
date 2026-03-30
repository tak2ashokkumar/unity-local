import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps.service';
import { DocumentAndCloseDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'cdh-document-and-close-step',
  templateUrl: './cdh-document-and-close-step.component.html',
  styleUrls: ['./cdh-document-and-close-step.component.scss']
})
export class CdhDocumentAndCloseStepComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: NetworkAgentsChatResponseType;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: DocumentAndCloseDataType;

  constructor(private cdhSvc: NaciCheckDeviceHealthStepsService) {
    this.cdhSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.cdhSvc.toggle('documentAndClose');
  }


}
