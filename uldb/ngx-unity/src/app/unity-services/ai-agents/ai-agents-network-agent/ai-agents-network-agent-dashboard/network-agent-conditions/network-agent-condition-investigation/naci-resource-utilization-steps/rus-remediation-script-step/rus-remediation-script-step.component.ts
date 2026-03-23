import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RemediationScriptViewData, RusRemediationScriptStepService } from './rus-remediation-script-step.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'rus-remediation-script-step',
  templateUrl: './rus-remediation-script-step.component.html',
  styleUrls: ['./rus-remediation-script-step.component.scss'],
  providers: [RusRemediationScriptStepService]
})
export class RusRemediationScriptStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: RusRemediationScriptStepService,
    private ruSvc: NaciResourceUtilizationStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.ruSvc.toggle('remediationScript');
  }

}
