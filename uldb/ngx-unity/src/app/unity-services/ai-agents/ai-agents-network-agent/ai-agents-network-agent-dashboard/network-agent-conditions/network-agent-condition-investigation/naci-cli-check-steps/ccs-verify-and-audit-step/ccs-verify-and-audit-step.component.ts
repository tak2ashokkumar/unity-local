import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CcsVerifyAndAuditStepService } from './ccs-verify-and-audit-step.service';
import { NaciCliCheckStepsService } from '../naci-cli-check-steps.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';

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

  constructor(private svc: CcsVerifyAndAuditStepService,
    private cliSvc: NaciCliCheckStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = stepName == 'verfiyAndAudit' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 1') {
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
    this.cliSvc.toggle('verfiyAndAudit');
  }

}
