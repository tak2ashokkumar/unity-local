import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
// import { UsiEventIngestionAzureCrudService } from '../usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
// import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { takeUntil } from 'rxjs/operators';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';
import { UsiEventIngestionAzureCrudService } from '../usi-event-ingestion-azure/usi-event-ingestion-azure-crud/usi-event-ingestion-azure-crud.service';

@Component({
  selector: 'usi-event-ingestion-custom',
  templateUrl: './usi-event-ingestion-custom.component.html',
  styleUrls: ['./usi-event-ingestion-custom.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionCustomComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Customs.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute) { }

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
      let k = res.find(rs => rs.source.name == 'Custom');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.router.navigate(['custom', 'crud'], {relativeTo: this.route});
  }

  viewInstanceDetails() {
    this.router.navigate(['custom'], { relativeTo: this.route });
  }
}
