import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NetworkAgentConditionInvestigationService, StageTitleMapping } from '../../network-agent-condition-investigation.service';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DeviceType, MonitoringDataType, NetworkAgentsChatResponseType } from '../../naci-chatbot/naci-chatbot.type';
import { NaciCliCheckStepsService } from '../../naci-cli-check-steps/naci-cli-check-steps.service';

@Component({
  selector: 'monitoring-verify-and-audit-step',
  templateUrl: './monitoring-verify-and-audit-step.component.html',
  styleUrls: ['./monitoring-verify-and-audit-step.component.scss']
})
export class MonitoringVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: NetworkAgentsChatResponseType;
  isVerifyAndAuditOpen: boolean = false;
  deviceData: DeviceType;

  constructor(private investigationSvc: NetworkAgentConditionInvestigationService) {
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
    const data = this.chatResponse?.answer?.data as MonitoringDataType;
    this.deviceData = data?.device;
  }

  toggleVerifyAndAuditAccordion() {
    this.investigationSvc.toggle('monitoring');
  }
}
