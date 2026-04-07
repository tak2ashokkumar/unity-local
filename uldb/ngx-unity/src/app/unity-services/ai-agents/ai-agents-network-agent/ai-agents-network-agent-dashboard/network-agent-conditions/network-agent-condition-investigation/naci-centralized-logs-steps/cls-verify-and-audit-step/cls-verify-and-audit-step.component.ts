import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CentralizedLogsViewData, ClsVerifyAndAuditStepService } from './cls-verify-and-audit-step.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CentralizedLogsDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'cls-verify-and-audit-step',
  templateUrl: './cls-verify-and-audit-step.component.html',
  styleUrls: ['./cls-verify-and-audit-step.component.scss'],
  providers: [ClsVerifyAndAuditStepService]
})
export class ClsVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;
  isVerifyAndAuditOpen: boolean = false;
  centralizedLogsViewData: CentralizedLogsViewData;

  constructor(private svc: ClsVerifyAndAuditStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = StepName == 'centralizedLogs' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.CENTRALIZED_LOGS) {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  verifyAudit() {
    this.centralizedLogsViewData = this.svc.convertToCentralizedLogsViewData(this.chatResponse?.answer?.data as CentralizedLogsDataType);
  }

  toggleVerifyAndAuditAccordion() {
    this.investigationSvc.toggle('centralizedLogs');
  }

}
