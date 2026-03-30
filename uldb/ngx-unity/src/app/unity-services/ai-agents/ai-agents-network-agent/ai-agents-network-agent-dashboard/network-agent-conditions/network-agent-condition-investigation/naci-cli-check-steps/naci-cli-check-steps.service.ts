import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NaciCheckDeviceHealthStepsService } from '../naci-check-device-health-steps/naci-check-device-health-steps.service';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps/naci-network-topology-steps.service';
import { NaciMonitoringService } from '../naci-monitoring/naci-monitoring.service';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps/naci-centralized-logs-steps.service';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps/naci-resource-utilization-steps.service';

@Injectable()
export class NaciCliCheckStepsService {

  private toggleAnnouncedSource = new Subject<string>();
  toggleAnnouncedSourceAnnounced$ = this.toggleAnnouncedSource.asObservable();

  constructor(private cdhSvc: NaciCheckDeviceHealthStepsService,
    private ntSvc: NaciNetworkTopologyStepsService,
    private monitoringSvc: NaciMonitoringService,
    private clSvc: NaciCentralizedLogsStepsService,
    private ruSvc: NaciResourceUtilizationStepsService) { }

  toggle(stepName: string) {
    this.toggleAnnouncedSource.next(stepName);
  }

  closeVerifyAndAuditStep(stageTitle: string) {
    switch (stageTitle) {
      case 'Monitoring':
        this.monitoringSvc.toggle('');
        break;
      case 'Resource Utilization':
        this.ruSvc.toggle('');
        break;
      case 'Check Device Health':
        this.cdhSvc.toggle('');
        break;
      case 'Centralized Logs':
        this.clSvc.toggle('');
        break;
      case 'Network Topology':
        this.ntSvc.toggle('');
        break;
      default: break;
    }
  }
}