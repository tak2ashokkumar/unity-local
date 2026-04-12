import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { UsiEventIngestionAppDynamicsCrudService } from '../usi-event-ingestion-app-dynamics/usi-event-ingestion-app-dynamics-crud/usi-event-ingestion-app-dynamics-crud.service';
import { UsiEventIngestionLogicMonitorCrudService } from '../usi-event-ingestion-logic-monitor/usi-event-ingestion-logic-monitor-crud/usi-event-ingestion-logic-monitor-crud.service';
import { UsiEventIngestionNagiosCrudService } from '../usi-event-ingestion-nagios/usi-event-ingestion-nagios-crud/usi-event-ingestion-nagios-crud.service';
import { UsiEventIngestionNewRelicCrudService } from '../usi-event-ingestion-new-relic/usi-event-ingestion-new-relic-crud/usi-event-ingestion-new-relic-crud.service';
import { UsiEventIngestionOpsrampCrudService } from '../usi-event-ingestion-opsramp/usi-event-ingestion-opsramp-crud/usi-event-ingestion-opsramp-crud.service';
import { UsiEventIngestionZabbixCrudService } from '../usi-event-ingestion-zabbix/usi-event-ingestion-zabbix-crud/usi-event-ingestion-zabbix-crud.service';
import { UsiEventIngestionDynatraceCrudService } from '../usi-event-ingeston-dynatrace/usi-event-ingestion-dynatrace-crud/usi-event-ingestion-dynatrace-crud.service';

@Component({
  selector: 'usi-ingest-event',
  templateUrl: './usi-ingest-event.component.html',
  styleUrls: ['./usi-ingest-event.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiIngestEventComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  addtooltipMsg: string;
  viewtooltipMsg: string;
  eventIngestion = EventIngestion;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private nagiosCrudService: UsiEventIngestionNagiosCrudService,
    private zabbixCrudService: UsiEventIngestionZabbixCrudService,
    private opsrampCrudService: UsiEventIngestionOpsrampCrudService,
    private appDynamicsCrudService: UsiEventIngestionAppDynamicsCrudService,
    private logicMonitorCrudService: UsiEventIngestionLogicMonitorCrudService,
    private dynatraceCrudService: UsiEventIngestionDynatraceCrudService,
    private newRelicrudService: UsiEventIngestionNewRelicCrudService,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.INTEGRATIONS) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.INTEGRATIONS) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.INTEGRATIONS)) {
      this.getEventSources();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEventSources() {
    this.svc.getEventSources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let k = res.find(rs => rs.source.name == 'Nagios');
      if (k) {
        this.eventIngestion.nagios.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'Zabbix');
      if (k) {
        this.eventIngestion.zabbix.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'OpsRamp');
      if (k) {
        this.eventIngestion.opsRamp.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'AppDynamics');
      if (k) {
        this.eventIngestion.appDynamics.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'LogicMonitor');
      if (k) {
        this.eventIngestion.logicMonitor.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'Dynatrace');
      if (k) {
        this.eventIngestion.dynatrace.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'NewRelic');
      if (k) {
        this.eventIngestion.newRelic.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'Custom');
      if (k) {
        this.eventIngestion.custom.length = k.source_account_count;
        k = null;
      }
      k = res.find(rs => rs.source.name == 'Email');
      if (k) {
        this.eventIngestion.email.length = k.source_account_count;
        k = null;
      }
    })
  }

  addNagiosInsatnce() {
    // this.nagiosCrudService.addOrEdit(null);
    this.router.navigate(['nagios/add'], { relativeTo: this.route });
  }

  viewNagiosInstanceDetails() {
    this.router.navigate(['nagios'], { relativeTo: this.route });
  }

  onNagiosCrud(event: CRUDActionTypes) {
    this.router.navigate(['nagios'], { relativeTo: this.route });
  }

  addZabbixInsatnce() {
    // this.zabbixCrudService.addOrEdit(null);
    this.router.navigate(['zabbix/add'], { relativeTo: this.route });
  }

  viewZabbixInstanceDetails() {
    this.router.navigate(['zabbix'], { relativeTo: this.route });
  }

  onZabbixCrud(event: CRUDActionTypes) {
    this.router.navigate(['zabbix'], { relativeTo: this.route });
  }

  addOpsRampInsatnce() {
    // this.opsrampCrudService.addOrEdit(null);
    this.router.navigate(['opsramp/add'], { relativeTo: this.route });
  }

  viewOpsRampInstanceDetails() {
    this.router.navigate(['opsramp'], { relativeTo: this.route });
  }

  onOpsRampCrud(event: CRUDActionTypes) {
    this.router.navigate(['opsramp'], { relativeTo: this.route });
  }

  addAppDynamicsInstance() {
    // this.appDynamicsCrudService.addOrEdit(null);
    this.router.navigate(['appdynamics/add'], { relativeTo: this.route });
  }

  viewAppDynamicsInstanceDetails() {
    this.router.navigate(['appdynamics'], { relativeTo: this.route });
  }

  onAppDynamicsCrud(event: CRUDActionTypes) {
    this.router.navigate(['appdynamics'], { relativeTo: this.route });
  }

  addLogicMonitorInstance() {
    // this.logicMonitorCrudService.addOrEdit(null);
    this.router.navigate(['logicmonitor/add'], { relativeTo: this.route });
  }

  viewLogicMonitorInstanceDetails() {
    this.router.navigate(['logicmonitor'], { relativeTo: this.route });
  }

  onLogicMonitorCrud(event: CRUDActionTypes) {
    this.router.navigate(['logicmonitor'], { relativeTo: this.route });
  }

  addDynatraceInsatnce() {
    // this.dynatraceCrudService.addOrEdit(null);
    this.router.navigate(['dynatrace/add'], { relativeTo: this.route });
  }

  viewDynatraceInstanceDetails() {
    this.router.navigate(['dynatrace'], { relativeTo: this.route });
  }

  onDynatraceCrud(event: CRUDActionTypes) {
    this.router.navigate(['dynatrace'], { relativeTo: this.route });
  }

  addNewRelicInsatnce() {
    // this.newRelicrudService.addOrEdit(null);
    this.router.navigate(['new-relic/add'], { relativeTo: this.route });
  }

  viewNewRelicInstanceDetails() {
    this.router.navigate(['new-relic'], { relativeTo: this.route });
  }

  onNewRelicCrud(event: CRUDActionTypes) {
    this.router.navigate(['new-relic'], { relativeTo: this.route });
  }

  addCustomInsatnce() {
    this.router.navigate(['custom', 'crud'], { relativeTo: this.route });
  }

  viewCustomInstanceDetails() {
    this.router.navigate(['custom'], { relativeTo: this.route });
  }

  addEmailInsatnce() {
    this.router.navigate(['email', 'crud'], { relativeTo: this.route });
  }

  viewEmailInstanceDetails() {
    this.router.navigate(['email'], { relativeTo: this.route });
  }

}

const EventIngestion = {
  'nagios': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Nagios.svg`,
    'length': 0
  },
  'zabbix': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Zabbix.svg`,
    'length': 0
  },
  'opsRamp': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/opsramp-integ.svg`,
    'length': 0
  },
  'appDynamics': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/appdynamics 1.svg`,
    'length': 0
  },
  'logicMonitor': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/LogicMonitoring.svg`,
    'length': 0
  },
  'dynatrace': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/dynatrace_logo.svg`,
    'length': 0
  },
  'newRelic': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/new-relic.svg`,
    'length': 0
  },
  'custom': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/custom-integ.svg`,
    'length': 0
  },
  'email': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Email.svg`,
    'length': 0
  }
}
