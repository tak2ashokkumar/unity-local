import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DocumentAndCloseDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'ccs-document-and-close-step',
  templateUrl: './ccs-document-and-close-step.component.html',
  styleUrls: ['./ccs-document-and-close-step.component.scss']
})
export class CcsDocumentAndCloseStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: NetworkAgentsChatResponseType;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: DocumentAndCloseDataType;

  constructor(private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.documentAndCloseOpen = stepName == 'documentAndClose' ? !this.documentAndCloseOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.DOCUMENT_AND_CLOSE) {
      return;
    }
    this.toggleDocumentAndClose();
    this.documentAndCloseViewData = this.chatResponse?.answer?.data as DocumentAndCloseDataType;
  }

  toggleDocumentAndClose() {
    this.investigationSvc.toggle('documentAndClose');
  }

}
