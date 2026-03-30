import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps.service';
import { CdhRemediationScriptStepService, RemediationScriptViewData } from './cdh-remediation-script-step.service';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType, RemediationScriptDataType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'cdh-remediation-script-step',
  templateUrl: './cdh-remediation-script-step.component.html',
  styleUrls: ['./cdh-remediation-script-step.component.scss'],
  providers: [CdhRemediationScriptStepService]
})
export class CdhRemediationScriptStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: CdhRemediationScriptStepService,
    private cdhSvc: NaciCheckDeviceHealthStepsService) {
    this.cdhSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isRemediationFixOpen = StepName == 'remediationScript' ? !this.isRemediationFixOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage != 'Stage 3') {
      return;
    }
    this.toggleRemediationFix();
    this.remediationScriptViewData = this.svc.convertToRemediationScriptViewData(this.chatResponse?.answer?.data as RemediationScriptDataType);
  }

  toggleRemediationFix() {
    this.cdhSvc.toggle('remediationScript');
  }

}
