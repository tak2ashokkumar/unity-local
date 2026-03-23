import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ClsRemediationScriptStepService, RemediationScriptViewData } from './cls-remediation-script-step.service';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cls-remediation-script-step',
  templateUrl: './cls-remediation-script-step.component.html',
  styleUrls: ['./cls-remediation-script-step.component.scss'],
  providers: [ClsRemediationScriptStepService]
})
export class ClsRemediationScriptStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: ClsRemediationScriptStepService,
    private clSvc: NaciCentralizedLogsStepsService) {
    this.clSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.remediationScriptViewData = this.svc.convertToRemediationScriptViewData(this.chatResponse?.answer);
  }

  toggleRemediationFix() {
    this.clSvc.toggle('remediationScript');
  }

}
