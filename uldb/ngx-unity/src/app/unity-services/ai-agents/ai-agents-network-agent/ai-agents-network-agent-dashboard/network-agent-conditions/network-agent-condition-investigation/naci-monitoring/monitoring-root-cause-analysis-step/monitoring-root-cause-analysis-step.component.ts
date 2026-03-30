import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisLogos, MonitoringRootCauseAnalysisStepService, NetworkAgentRCAViewData } from './monitoring-root-cause-analysis-step.service';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { NetworkAgentsChatResponseType, RcaDataType } from '../../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'monitoring-root-cause-analysis-step',
  templateUrl: './monitoring-root-cause-analysis-step.component.html',
  styleUrls: ['./monitoring-root-cause-analysis-step.component.scss'],
  providers: [MonitoringRootCauseAnalysisStepService]
})
export class MonitoringRootCauseAnalysisStepComponent implements OnInit, OnChanges {

  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: NetworkAgentsChatResponseType;

  isRCAOpen: boolean = false;
  rcaViewData: NetworkAgentRCAViewData;
  analysisLogos = AnalysisLogos;

  constructor(private svc: MonitoringRootCauseAnalysisStepService,
    private monitoringSvc: NaciMonitoringService) {
    this.monitoringSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.rcaViewData = this.svc.convertToRCAViewData(this.chatResponse?.answer?.data as RcaDataType);
  }

  toggleRCAAccordion() {
    this.monitoringSvc.toggle('rca');
  }



}
