import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UsiEventIngestionGcpCrudService } from '../usi-event-ingestion-gcp-crud/usi-event-ingestion-gcp-crud.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-event-ingestion-gcp-widget',
  templateUrl: './usi-event-ingestion-gcp-widget.component.html',
  styleUrls: ['./usi-event-ingestion-gcp-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionGcpWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Google_Cloud_Platform-Logo 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionGcpCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'GCP');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['gcp'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['gcp'], { relativeTo: this.route });
  }
}
