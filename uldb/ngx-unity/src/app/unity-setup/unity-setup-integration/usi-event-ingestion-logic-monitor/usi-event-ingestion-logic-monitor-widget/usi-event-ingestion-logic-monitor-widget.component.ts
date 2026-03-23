import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UsiEventIngestionLogicMonitorCrudService } from '../usi-event-ingestion-logic-monitor-crud/usi-event-ingestion-logic-monitor-crud.service';

@Component({
  selector: 'usi-event-ingestion-logic-monitor-widget',
  templateUrl: './usi-event-ingestion-logic-monitor-widget.component.html',
  styleUrls: ['./usi-event-ingestion-logic-monitor-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionLogicMonitorWidgetComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/LogicMonitoring.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionLogicMonitorCrudService) { }

  ngOnInit() {
    this.viewtooltipMsg = 'View Details';
    this.getEventSources();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEventSources() {
    this.svc.getEventSources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let k = res.find(rs => rs.source.name == 'LogicMonitor');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInstance() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['logicmonitor'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['logicmonitor'], { relativeTo: this.route });
  }
}
