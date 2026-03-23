import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { NtRemediationScriptStepService, RemediationScriptViewData } from './nt-remediation-script-step.service';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nt-remediation-script-step',
  templateUrl: './nt-remediation-script-step.component.html',
  styleUrls: ['./nt-remediation-script-step.component.scss'],
  providers: [NtRemediationScriptStepService]
})
export class NtRemediationScriptStepComponent implements OnInit,OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: NtRemediationScriptStepService,
    private ruSvc: NaciNetworkTopologyStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      this.isRemediationFixOpen = StepName == 'remediationScript' ? !this.isRemediationFixOpen : false;
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage != 'Stage 3') {
      return;
    }
    this.toggleRemediationFix();
    this.remediationScriptViewData = this.svc.convertToRemediationScriptViewData(this.chatResponse?.answer);
  }

  toggleRemediationFix() {
    this.ruSvc.toggle('remediationScript');
  }

}
