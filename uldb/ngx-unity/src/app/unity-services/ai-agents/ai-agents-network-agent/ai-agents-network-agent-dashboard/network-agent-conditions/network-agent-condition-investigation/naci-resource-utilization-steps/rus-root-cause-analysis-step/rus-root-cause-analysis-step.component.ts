import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AnalysisLogos, RusRootCauseAnalysisStepService } from './rus-root-cause-analysis-step.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'rus-root-cause-analysis-step',
  templateUrl: './rus-root-cause-analysis-step.component.html',
  styleUrls: ['./rus-root-cause-analysis-step.component.scss'],
  providers: [RusRootCauseAnalysisStepService]
})
export class RusRootCauseAnalysisStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  isRCAOpen: boolean = false;
  rcaViewData: any;
  analysisLogos = AnalysisLogos;

  constructor(private svc: RusRootCauseAnalysisStepService,
    private ruSvc: NaciResourceUtilizationStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.ruSvc.toggle('rca');
  }
}
