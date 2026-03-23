import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MonitoringMetricWidgetViewData, MonitoringVerifyAndAuditStepService } from './monitoring-verify-and-audit-step.service';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'monitoring-verify-and-audit-step',
  templateUrl: './monitoring-verify-and-audit-step.component.html',
  styleUrls: ['./monitoring-verify-and-audit-step.component.scss'],
  providers: [MonitoringVerifyAndAuditStepService]
})
export class MonitoringVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;
  isVerifyAndAuditOpen: boolean = false;
  verifyAuditViewData: MonitoringMetricWidgetViewData;

  constructor(private svc: MonitoringVerifyAndAuditStepService,
    private monitoringSvc: NaciMonitoringService) {
    this.monitoringSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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

  verifyAudit() {
    this.verifyAuditViewData = this.chatResponse.answer;
    this.verifyAuditViewData = this.svc.convertToVerifyAndAuditViewData(this.chatResponse?.answer);
  }

  toggleVerifyAndAuditAccordion() {
    this.monitoringSvc.toggle('verfiyAndAudit');
  }

}
