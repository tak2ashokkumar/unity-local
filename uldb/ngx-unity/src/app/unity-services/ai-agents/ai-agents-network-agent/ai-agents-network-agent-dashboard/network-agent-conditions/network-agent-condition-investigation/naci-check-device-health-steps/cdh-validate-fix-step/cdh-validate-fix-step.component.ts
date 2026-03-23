import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CdhValidateFixStepService } from './cdh-validate-fix-step.service';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'cdh-validate-fix-step',
  templateUrl: './cdh-validate-fix-step.component.html',
  styleUrls: ['./cdh-validate-fix-step.component.scss'],
  providers: [CdhValidateFixStepService]
})
export class CdhValidateFixStepComponent implements OnInit, OnChanges {

  private ngUnsubscribe = new Subject();

  isValidateFixOpen: boolean = false;
  @Input() chatResponse: any;
  validateFixViewData: any;

  constructor(private svc: CdhValidateFixStepService,
    private cdhSvc: NaciCheckDeviceHealthStepsService) {
    this.cdhSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.cdhSvc.toggle('validateFix');
  }

}
