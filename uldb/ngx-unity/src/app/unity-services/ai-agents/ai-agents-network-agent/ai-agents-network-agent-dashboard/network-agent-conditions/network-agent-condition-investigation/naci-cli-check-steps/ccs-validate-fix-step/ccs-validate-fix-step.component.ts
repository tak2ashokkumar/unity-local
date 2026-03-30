import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CcsValidateFixStepService } from './ccs-validate-fix-step.service';
import { NaciCliCheckStepsService } from '../naci-cli-check-steps.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType, ValidateFixDataType } from '../../naci-chatbot/naci-chatbot.type';

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
  @Input() verifyAndAuditRelatedStageTitle: string;
  validateFixViewData: any;

  constructor(private svc: CcsValidateFixStepService,
    private cliSvc: NaciCliCheckStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isValidateFixOpen = stepName == 'validateFix' ? !this.isValidateFixOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 4') {
      return;
    }
    this.toggleValidateFix();
    this.validateFixViewData = this.svc.convertToValidateFixViewData(this.chatResponse?.answer?.data as ValidateFixDataType);
  }

  toggleValidateFix() {
    this.cliSvc.closeVerifyAndAuditStep(this.verifyAndAuditRelatedStageTitle);
    this.cliSvc.toggle('validateFix');
  }

}
