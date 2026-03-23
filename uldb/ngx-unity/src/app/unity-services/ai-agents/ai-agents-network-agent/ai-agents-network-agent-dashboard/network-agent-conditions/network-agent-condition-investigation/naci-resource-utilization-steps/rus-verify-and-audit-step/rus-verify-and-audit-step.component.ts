import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { InterfaceWidgetViewData, ResourceUtilizationWidgetViewData, RusVerifyAndAuditStepService } from './rus-verify-and-audit-step.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'rus-verify-and-audit-step',
  templateUrl: './rus-verify-and-audit-step.component.html',
  styleUrls: ['./rus-verify-and-audit-step.component.scss'],
  providers: [RusVerifyAndAuditStepService]
})
export class RusVerifyAndAuditStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;
  isVerifyAndAuditOpen: boolean = false;

  resourceUtilizationWidgetViewData: ResourceUtilizationWidgetViewData;
  interfaceWidgetViewData: InterfaceWidgetViewData;

  constructor(private svc: RusVerifyAndAuditStepService,
    private cliSvc: NaciResourceUtilizationStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
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
    this.resourceUtilizationWidgetViewData = new ResourceUtilizationWidgetViewData();
    this.interfaceWidgetViewData = new InterfaceWidgetViewData();
    this.resourceUtilizationWidgetViewData = this.svc.convertToResourceUtilizationChartData(this.chatResponse?.answer?.data?.resource_summary);
    this.interfaceWidgetViewData.chartData = this.svc.convertToInterfaceChartData(this.chatResponse?.answer?.data?.metrics);
  }

  toggleVerifyAndAuditAccordion() {
    this.cliSvc.toggle('verfiyAndAudit');
  }
}
