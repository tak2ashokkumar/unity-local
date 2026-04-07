import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CdhVerifyAndAuditStepService, DeviceHealthMetricWidgetViewData, DeviceHealthSummaryViewData } from './cdh-verify-and-audit-step.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CheckDeviceHealthDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';

@Component({
  selector: 'cdh-verify-and-audit-step',
  templateUrl: './cdh-verify-and-audit-step.component.html',
  styleUrls: ['./cdh-verify-and-audit-step.component.scss'],
  providers: [CdhVerifyAndAuditStepService]
})
export class CdhVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  isVerifyAndAuditOpen: boolean = false;
  @Input() chatResponse: NetworkAgentsChatResponseType;
  deviceHealthSummaryViewData: DeviceHealthSummaryViewData;
  deviceHealthMetricWidgetViewData: DeviceHealthMetricWidgetViewData;

  constructor(private svc: CdhVerifyAndAuditStepService,
    private investigationSvc: NetworkAgentConditionInvestigationService) {
    this.investigationSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = StepName == 'checkDeviceHealth' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage_title != StageTitleMapping.CHECK_DEVICE_HEALTH) {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  toggleVerifyAndAuditAccordion() {
    this.investigationSvc.toggle('checkDeviceHealth');
  }

  verifyAudit() {
    const chatResponseData = this.chatResponse?.answer?.data as CheckDeviceHealthDataType;
    this.deviceHealthSummaryViewData = this.svc.convertToDeviceHealthSummaryViewData(chatResponseData?.resource_utilization);
    this.deviceHealthMetricWidgetViewData = this.svc.convertToDeviceHealthMetricWidgetViewData(chatResponseData?.metrics);
  }


}
