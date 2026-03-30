import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClsValidateFixStepService, ValidateFixViewData } from './cls-validate-fix-step.service';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps.service';
import { NetworkAgentsChatResponseType, ValidateFixDataType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'cls-validate-fix-step',
  templateUrl: './cls-validate-fix-step.component.html',
  styleUrls: ['./cls-validate-fix-step.component.scss'],
  providers: [ClsValidateFixStepService]
})
export class ClsValidateFixStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: NetworkAgentsChatResponseType;
  validateFixViewData: ValidateFixViewData;

  constructor(private svc: ClsValidateFixStepService,
    private clSvc: NaciCentralizedLogsStepsService) {
    this.clSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isValidateFixOpen = StepName == 'validateFix' ? !this.isValidateFixOpen : false;
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
    this.clSvc.toggle('validateFix');
  }
}
