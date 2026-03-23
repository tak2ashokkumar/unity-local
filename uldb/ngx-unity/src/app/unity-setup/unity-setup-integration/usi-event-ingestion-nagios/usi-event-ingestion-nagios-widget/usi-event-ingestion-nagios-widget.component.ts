import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { environment } from 'src/environments/environment';
import { UsiEventIngestionNagiosCrudService } from '../usi-event-ingestion-nagios-crud/usi-event-ingestion-nagios-crud.service';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-event-ingestion-nagios-widget',
  templateUrl: './usi-event-ingestion-nagios-widget.component.html',
  styleUrls: ['./usi-event-ingestion-nagios-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionNagiosWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Nagios.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionNagiosCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'Aws');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    // this.crudService.addOrEdit(null);
    this.router.navigate(['nagios/add'], { relativeTo: this.route });
  }

  viewInstanceDetails() {
    this.router.navigate(['nagios'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['nagios'], { relativeTo: this.route });
  }

}
