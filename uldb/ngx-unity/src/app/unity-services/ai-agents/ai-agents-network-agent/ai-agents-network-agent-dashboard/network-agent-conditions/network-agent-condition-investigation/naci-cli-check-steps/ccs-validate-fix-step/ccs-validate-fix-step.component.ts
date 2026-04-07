import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CcsValidateFixStepService } from './ccs-validate-fix-step.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType, ValidateFixDataType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'ccs-validate-fix-step',
  templateUrl: './ccs-validate-fix-step.component.html',
  styleUrls: ['./ccs-validate-fix-step.component.scss'],
  providers: [CcsValidateFixStepService]
})
export class CcsValidateFixStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: NetworkAgentsChatResponseType;
  validateFixViewData: any;

  constructor(private svc: CcsValidateFixStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isValidateFixOpen = stepName == 'validateFix' ? !this.isValidateFixOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.VALIDATE_FIX) {
      return;
    }
    this.toggleValidateFix();
    this.validateFixViewData = this.svc.convertToValidateFixViewData(this.chatResponse?.answer?.data as ValidateFixDataType);
  }

  toggleValidateFix() {
    this.investigationSvc.toggle('validateFix');
  }

}
