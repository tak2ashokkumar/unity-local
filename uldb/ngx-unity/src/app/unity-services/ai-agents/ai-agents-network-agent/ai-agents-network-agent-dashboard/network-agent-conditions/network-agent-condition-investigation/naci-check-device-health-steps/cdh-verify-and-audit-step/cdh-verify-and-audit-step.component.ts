import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CdhVerifyAndAuditStepService, DeviceHealthMetricWidgetViewData, DeviceHealthSummaryViewData } from './cdh-verify-and-audit-step.service';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CheckDeviceHealthDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NaciCliCheckStepsService } from '../../naci-cli-check-steps/naci-cli-check-steps.service';

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
    private cliSvc: NaciCliCheckStepsService,
    private cdhSvc: NaciCheckDeviceHealthStepsService) {
    this.cdhSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isVerifyAndAuditOpen = StepName == 'verfiyAndAudit' ? !this.isVerifyAndAuditOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 1') {
      return;
    }
    this.toggleVerifyAndAuditAccordion();
    this.verifyAudit();
  }

  toggleVerifyAndAuditAccordion() {
    if (!this.isVerifyAndAuditOpen) {
      this.cliSvc.toggle('');
    }
    this.cdhSvc.toggle('verfiyAndAudit');
  }

  verifyAudit() {
    const chatResponseData = this.chatResponse?.answer?.data as CheckDeviceHealthDataType;
    this.deviceHealthSummaryViewData = this.svc.convertToDeviceHealthSummaryViewData(chatResponseData?.resource_utilization);
    this.deviceHealthMetricWidgetViewData = this.svc.convertToDeviceHealthMetricWidgetViewData(chatResponseData?.metrics);
  }


}
