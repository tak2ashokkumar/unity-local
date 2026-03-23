import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnalysisLogos, ClsRootCauseAnalysisStepService } from './cls-root-cause-analysis-step.service';
import { Subject } from 'rxjs';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cls-root-cause-analysis-step',
  templateUrl: './cls-root-cause-analysis-step.component.html',
  styleUrls: ['./cls-root-cause-analysis-step.component.scss'],
  providers: [ClsRootCauseAnalysisStepService]
})
export class ClsRootCauseAnalysisStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  isRCAOpen: boolean = false;
  rcaViewData: any;
  analysisLogos = AnalysisLogos;

  constructor(private svc: ClsRootCauseAnalysisStepService,
    private clSvc: NaciCentralizedLogsStepsService) {
    this.clSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.clSvc.toggle('rca');
  }

}
