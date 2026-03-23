import { Component, OnInit } from '@angular/core';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsiEventIngestionNewRelicCrudService } from '../usi-event-ingestion-new-relic-crud/usi-event-ingestion-new-relic-crud.service';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'usi-event-ingestion-new-relic-widget',
  templateUrl: './usi-event-ingestion-new-relic-widget.component.html',
  styleUrls: ['./usi-event-ingestion-new-relic-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionNewRelicWidgetComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/new-relic.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionNewRelicCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'NewRelic');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['new-relic'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['new-relic'], { relativeTo: this.route });
  }

}
