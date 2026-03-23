import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UsiEventIngestionAzureCrudService } from '../usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-event-ingestion-azure-widget',
  templateUrl: './usi-event-ingestion-azure-widget.component.html',
  styleUrls: ['./usi-event-ingestion-azure-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionAzureWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Azure.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionAzureCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'Azure');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['azure'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['azure'], { relativeTo: this.route });
  }

}
