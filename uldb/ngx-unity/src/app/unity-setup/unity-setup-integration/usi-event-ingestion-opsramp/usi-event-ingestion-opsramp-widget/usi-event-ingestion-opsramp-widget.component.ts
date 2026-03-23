import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UsiEventIngestionOpsrampCrudService } from '../usi-event-ingestion-opsramp-crud/usi-event-ingestion-opsramp-crud.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'usi-event-ingestion-opsramp-widget',
  templateUrl: './usi-event-ingestion-opsramp-widget.component.html',
  styleUrls: ['./usi-event-ingestion-opsramp-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionOpsrampWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/opsramp 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionOpsrampCrudService) { }

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
        let k = res.find(rs => rs.source.name == 'Opsramp');
        if (k) {
          this.viewDisabled = false;
        }
      })
    }
  
    addInsatnce() {
      this.crudService.addOrEdit(null);
    }
  
    viewInstanceDetails() {
      this.router.navigate(['opsramp'], { relativeTo: this.route });
    }
  
    onCrud(event: CRUDActionTypes) {
      this.router.navigate(['opsramp'], { relativeTo: this.route });
    }

}
