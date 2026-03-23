import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UsiEventIngestionOciCrudService } from '../usi-event-ingestion-oci-crud/usi-event-ingestion-oci-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-event-ingestion-oci-widget',
  templateUrl: './usi-event-ingestion-oci-widget.component.html',
  styleUrls: ['./usi-event-ingestion-oci-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionOciWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Oracle-cloud 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionOciCrudService) { }

  ngOnInit(): void {
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
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['oci'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['oci'], { relativeTo: this.route });
  }

}
