import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CcsRemediationScriptStepService, RemediationScriptViewData } from './ccs-remediation-script-step.service';
import { NaciCliCheckStepsService } from '../naci-cli-check-steps.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ccs-remediation-script-step',
  templateUrl: './ccs-remediation-script-step.component.html',
  styleUrls: ['./ccs-remediation-script-step.component.scss'],
  providers: [CcsRemediationScriptStepService]
})
export class CcsRemediationScriptStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: CcsRemediationScriptStepService,
    private cliSvc: NaciCliCheckStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.cliSvc.toggle('remediationScript');
  }

}
