import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { UsiEventIngestionAppDynamicsCrudService } from '../usi-event-ingestion-app-dynamics-crud/usi-event-ingestion-app-dynamics-crud.service';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'usi-event-ingestion-app-dynamics-widget',
  templateUrl: './usi-event-ingestion-app-dynamics-widget.component.html',
  styleUrls: ['./usi-event-ingestion-app-dynamics-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionAppDynamicsWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/appdynamics 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionAppDynamicsCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'AppDynamics');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInstance() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['appdynamics'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['appdynamics'], { relativeTo: this.route });
  }
}
