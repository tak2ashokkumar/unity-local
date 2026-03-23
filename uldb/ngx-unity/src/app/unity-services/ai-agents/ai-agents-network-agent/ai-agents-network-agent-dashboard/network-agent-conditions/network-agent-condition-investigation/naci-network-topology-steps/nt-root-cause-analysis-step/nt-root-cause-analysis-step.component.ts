import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AnalysisLogos, NtRootCauseAnalysisStepService } from './nt-root-cause-analysis-step.service';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nt-root-cause-analysis-step',
  templateUrl: './nt-root-cause-analysis-step.component.html',
  styleUrls: ['./nt-root-cause-analysis-step.component.scss'],
  providers: [NtRootCauseAnalysisStepService]
})
export class NtRootCauseAnalysisStepComponent implements OnInit,OnChanges {

  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  isRCAOpen: boolean = false;
  rcaViewData: any;
  analysisLogos = AnalysisLogos;

  constructor(private svc: NtRootCauseAnalysisStepService,
    private ruSvc: NaciNetworkTopologyStepsService) {
    this.ruSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      this.isRCAOpen = StepName == 'rca' ? !this.isRCAOpen : false;
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
