import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MonitoringMetricWidgetViewData, MonitoringVerifyAndAuditStepService } from './monitoring-verify-and-audit-step.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MonitoringDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'monitoring-verify-and-audit-step',
  templateUrl: './monitoring-verify-and-audit-step.component.html',
  styleUrls: ['./monitoring-verify-and-audit-step.component.scss'],
  providers: [MonitoringVerifyAndAuditStepService]
})
export class MonitoringVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;
  isVerifyAndAuditOpen: boolean = false;
  verifyAuditViewData: MonitoringMetricWidgetViewData;

  constructor(private svc: MonitoringVerifyAndAuditStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = StepName == 'monitoring' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.MONITORING) {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  verifyAudit() {
    this.verifyAuditViewData = this.svc.convertToVerifyAndAuditViewData(this.chatResponse?.answer?.data as MonitoringDataType);
  }

  toggleVerifyAndAuditAccordion() {
    this.investigationSvc.toggle('monitoring');
  }

}
