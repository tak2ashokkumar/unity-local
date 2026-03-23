import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CentralizedLogsViewData, ClsVerifyAndAuditStepService } from './cls-verify-and-audit-step.service';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cls-verify-and-audit-step',
  templateUrl: './cls-verify-and-audit-step.component.html',
  styleUrls: ['./cls-verify-and-audit-step.component.scss'],
  providers: [ClsVerifyAndAuditStepService]
})
export class ClsVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;
  isVerifyAndAuditOpen: boolean = false;
  centralizedLogsViewData: CentralizedLogsViewData;

  constructor(private svc: ClsVerifyAndAuditStepService,
    private clSvc: NaciCentralizedLogsStepsService) {
    this.clSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.centralizedLogsViewData = this.svc.convertToCentralizedLogsViewData(this.chatResponse?.answer?.data);
  }

  toggleVerifyAndAuditAccordion() {
    this.clSvc.toggle('verfiyAndAudit');
  }

}
