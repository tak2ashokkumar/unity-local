import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnalysisLogos, CdhRrotCauseAnalysisStepService } from './cdh-rrot-cause-analysis-step.service';
import { Subject } from 'rxjs';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cdh-root-cause-analysis-step',
  templateUrl: './cdh-root-cause-analysis-step.component.html',
  styleUrls: ['./cdh-root-cause-analysis-step.component.scss'],
  providers: [CdhRrotCauseAnalysisStepService]
})
export class CdhRootCauseAnalysisStepComponent implements OnInit, OnChanges {

  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  isRCAOpen: boolean = false;
  rcaViewData: any;
  analysisLogos = AnalysisLogos;

  constructor(private svc: CdhRrotCauseAnalysisStepService,
    private cdhSvc: NaciCheckDeviceHealthStepsService) {
    this.cdhSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isRCAOpen = StepName == 'rca' ? !this.isRCAOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage != 'Stage 2') {
      return;
    }
    this.toggleRCAAccordion();
    this.rcaViewData = this.svc.convertToRCAViewData(this.chatResponse?.answer);
  }

  toggleRCAAccordion() {
    this.cdhSvc.toggle('rca');
  }


}
