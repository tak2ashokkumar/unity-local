import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { MonitoringRemediationScriptStepService, RemediationScriptViewData } from './monitoring-remediation-script-step.service';
import { NaciMonitoringService } from '../naci-monitoring.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'monitoring-remediation-script-step',
  templateUrl: './monitoring-remediation-script-step.component.html',
  styleUrls: ['./monitoring-remediation-script-step.component.scss'],
  providers: [MonitoringRemediationScriptStepService]
})
export class MonitoringRemediationScriptStepComponent implements OnInit, OnChanges {

  private ngUnsubscribe = new Subject();

  @Input() chatResponse: any;

  isRemediationFixOpen: boolean = false;
  remediationScriptViewData: RemediationScriptViewData;

  constructor(private svc: MonitoringRemediationScriptStepService,
    private monitoringSvc: NaciMonitoringService) {
    this.monitoringSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.isRemediationFixOpen = StepName == 'remediationScript' ? !this.isRemediationFixOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chatResponse?.answer?.stage != 'Stage 3') {
      return;
    }
    this.toggleRemediationFix();
    this.remediationScriptViewData = this.svc.convertToRemediationScriptViewData(this.chatResponse?.answer);
  }

  toggleRemediationFix() {
    this.monitoringSvc.toggle('remediationScript');
  }

}
