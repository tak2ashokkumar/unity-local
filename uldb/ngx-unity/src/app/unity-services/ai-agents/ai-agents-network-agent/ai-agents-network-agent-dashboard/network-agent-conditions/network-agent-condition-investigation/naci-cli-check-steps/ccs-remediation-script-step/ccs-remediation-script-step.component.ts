import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CcsRemediationScriptStepService, RemediationScriptViewData } from './ccs-remediation-script-step.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NetworkAgentsChatResponseType, RemediationScriptDataType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'ccs-remediation-script-step',
  templateUrl: './ccs-remediation-script-step.component.html',
  styleUrls: ['./ccs-remediation-script-step.component.scss'],
  providers: [CcsRemediationScriptStepService]
})
export class CcsRemediationScriptStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: CcsRemediationScriptStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isRemediationFixOpen = stepName == 'remediationScript' ? !this.isRemediationFixOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.REMEDIATION_SCRIPT) {
      return;
    }
    this.toggleRemediationFix();
    this.remediationScriptViewData = this.svc.convertToRemediationScriptViewData(this.chatResponse?.answer?.data as RemediationScriptDataType);
  }

  toggleRemediationFix() {
    this.investigationSvc.toggle('remediationScript');
  }

}
