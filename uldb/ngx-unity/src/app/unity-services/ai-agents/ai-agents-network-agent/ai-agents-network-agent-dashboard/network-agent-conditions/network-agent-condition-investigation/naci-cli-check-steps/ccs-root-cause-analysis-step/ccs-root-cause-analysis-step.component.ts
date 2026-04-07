import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnalysisLogos, CcsRootCauseAnalysisStepService } from './ccs-root-cause-analysis-step.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NetworkAgentsChatResponseType, RcaDataType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'ccs-root-cause-analysis-step',
  templateUrl: './ccs-root-cause-analysis-step.component.html',
  styleUrls: ['./ccs-root-cause-analysis-step.component.scss'],
  providers: [CcsRootCauseAnalysisStepService]
})
export class CcsRootCauseAnalysisStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: NetworkAgentsChatResponseType;

  isRCAOpen: boolean = false;
  rcaViewData: any;
  analysisLogos = AnalysisLogos;

  constructor(private svc: CcsRootCauseAnalysisStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((stepName) => {
      setTimeout(() => {
        this.isRCAOpen = stepName == 'rca' ? !this.isRCAOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.RCA) {
      return;
    }
    this.toggleRCAAccordion();
    this.rcaViewData = this.svc.convertToRCAViewData(this.chatResponse?.answer?.data as RcaDataType);
  }

  toggleRCAAccordion() {
    this.investigationSvc.toggle('rca');
  }

}
