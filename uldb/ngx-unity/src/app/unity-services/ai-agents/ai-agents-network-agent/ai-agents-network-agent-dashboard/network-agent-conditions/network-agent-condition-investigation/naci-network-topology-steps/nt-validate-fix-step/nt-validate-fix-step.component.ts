import { Component, Input, OnInit } from '@angular/core';
import { NtValidateFixStepService } from './nt-validate-fix-step.service';
import { Subject } from 'rxjs';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nt-validate-fix-step',
  templateUrl: './nt-validate-fix-step.component.html',
  styleUrls: ['./nt-validate-fix-step.component.scss'],
  providers: [NtValidateFixStepService]
})
export class NtValidateFixStepComponent implements OnInit {

private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: any;
  validateFixViewData: any;

  constructor(private svc: NtValidateFixStepService,
    private ruSvc: NaciNetworkTopologyStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      this.isValidateFixOpen = StepName == 'validateFix' ? !this.isValidateFixOpen : false;
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 4') {
      return;
    }
    this.toggleValidateFix();
    this.validateFixViewData = this.svc.convertToValidateFixViewData(this.chatResponse?.answer);
  }

  toggleValidateFix() {
    this.ruSvc.toggle('validateFix');
  }
}
