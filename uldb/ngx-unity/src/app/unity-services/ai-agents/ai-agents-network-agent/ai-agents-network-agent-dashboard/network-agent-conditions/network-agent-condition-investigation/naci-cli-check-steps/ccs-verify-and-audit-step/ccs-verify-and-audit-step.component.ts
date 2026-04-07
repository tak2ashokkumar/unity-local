import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CcsVerifyAndAuditStepService } from './ccs-verify-and-audit-step.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'ccs-verify-and-audit-step',
  templateUrl: './ccs-verify-and-audit-step.component.html',
  styleUrls: ['./ccs-verify-and-audit-step.component.scss'],
  providers: [CcsVerifyAndAuditStepService]
})
export class CcsVerifyAndAuditStepComponent implements OnInit, OnChanges {

  private ngUnsubscribe = new Subject();
  @Input() chatResponse: NetworkAgentsChatResponseType;
  isVerifyAndAuditOpen: boolean = false;
  verifyAuditViewData: any;

  constructor(private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = stepName == 'basicCliCheck' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.BASIC_CLI_CHECK) {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  verifyAudit() {
    this.verifyAuditViewData = this.chatResponse.answer;
    // this.verifyAuditViewData = this.svc.convertToVerifyAndAuditViewData(this.chatResponse?.answer);
    // console.log(this.verifyAuditViewData, 'vf & avd')
  }


  toggleVerifyAndAuditAccordion() {
    this.investigationSvc.toggle('basicCliCheck');
  }

}
