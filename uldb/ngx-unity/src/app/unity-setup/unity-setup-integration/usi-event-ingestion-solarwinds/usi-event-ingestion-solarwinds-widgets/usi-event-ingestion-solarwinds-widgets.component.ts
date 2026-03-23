import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsiEventIngestionSolarwindsCrudService } from '../usi-event-ingestion-solarwinds-crud/usi-event-ingestion-solarwinds-crud.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Component({
  selector: 'usi-event-ingestion-solarwinds-widgets',
  templateUrl: './usi-event-ingestion-solarwinds-widgets.component.html',
  styleUrls: ['./usi-event-ingestion-solarwinds-widgets.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionSolarwindsWidgetsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/solarwinds 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionSolarwindsCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'SolarWinds');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['solarwinds'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['solarwinds'], { relativeTo: this.route });
  }
}
