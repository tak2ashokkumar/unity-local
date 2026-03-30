import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MonitoringValidateFixStepService, ValidateFixViewData } from './monitoring-validate-fix-step.service';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType, ValidateFixDataType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'monitoring-validate-fix-step',
  templateUrl: './monitoring-validate-fix-step.component.html',
  styleUrls: ['./monitoring-validate-fix-step.component.scss'],
  providers: [MonitoringValidateFixStepService]
})
export class MonitoringValidateFixStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: NetworkAgentsChatResponseType;
  validateFixViewData: ValidateFixViewData;

  constructor(private svc: MonitoringValidateFixStepService,
    private monitoringSvc: NaciMonitoringService) {
    this.monitoringSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.monitoringSvc.toggle('validateFix');
  }


}
