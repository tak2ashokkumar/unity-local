import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RusValidateFixStepService } from './rus-validate-fix-step.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';

@Component({
  selector: 'rus-validate-fix-step',
  templateUrl: './rus-validate-fix-step.component.html',
  styleUrls: ['./rus-validate-fix-step.component.scss'],
  providers: [RusValidateFixStepService]
})
export class RusValidateFixStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: any;
  validateFixViewData: any;

  constructor(private svc: RusValidateFixStepService,
    private ruSvc: NaciResourceUtilizationStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.validateFixViewData = this.svc.convertToValidateFixViewData(this.chatResponse?.answer);
  }

  toggleValidateFix() {
    this.ruSvc.toggle('validateFix');
  }
}
