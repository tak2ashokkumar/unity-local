import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { InterfaceWidgetViewData, ResourceUtilizationWidgetViewData, RusVerifyAndAuditStepService } from './rus-verify-and-audit-step.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';
import { takeUntil } from 'rxjs/operators';
import { NetworkAgentsChatResponseType, ResourceUtilizationDataType } from '../../naci-chatbot/naci-chatbot.type';
import { NaciCliCheckStepsService } from '../../naci-cli-check-steps/naci-cli-check-steps.service';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'rus-verify-and-audit-step',
  templateUrl: './rus-verify-and-audit-step.component.html',
  styleUrls: ['./rus-verify-and-audit-step.component.scss'],
  providers: [RusVerifyAndAuditStepService]
})
export class RusVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;

  isVerifyAndAuditOpen: boolean = false;
  resourceUtilizationWidgetViewData: ResourceUtilizationWidgetViewData;
  interfaceWidgetViewData: InterfaceWidgetViewData;

  constructor(private svc: RusVerifyAndAuditStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService,
    private ruSvc: NaciResourceUtilizationStepsService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = StepName == 'resourceUtilization' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.RESOURCE_UTILIZATION) {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  verifyAudit() {
    this.resourceUtilizationWidgetViewData = new ResourceUtilizationWidgetViewData();
    this.interfaceWidgetViewData = new InterfaceWidgetViewData();
    const resourceUtlizationData = this.chatResponse?.answer?.data as ResourceUtilizationDataType;
    this.resourceUtilizationWidgetViewData = this.svc.convertToResourceUtilizationChartData(resourceUtlizationData?.resource_summary);
    this.interfaceWidgetViewData.chartData = this.svc.convertToInterfaceChartData(resourceUtlizationData?.metrics);
  }

  toggleVerifyAndAuditAccordion() {
    // if (!this.isVerifyAndAuditOpen) {
    //   this.cliSvc.toggle('');
    // }
    this.investigationSvc.toggle('resourceUtilization');
  }
}
