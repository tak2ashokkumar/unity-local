import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsiEventIngestionDynatraceCrudService } from '../usi-event-ingestion-dynatrace-crud/usi-event-ingestion-dynatrace-crud.service';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'usi-event-ingestion-dynatrace-widget',
  templateUrl: './usi-event-ingestion-dynatrace-widget.component.html',
  styleUrls: ['./usi-event-ingestion-dynatrace-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionDynatraceWidgetComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/dynatrace_logo.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionDynatraceCrudService) { }

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
      let k = res.find(rs => rs.source.name == 'Dynatrace');
      if (k) {
        this.viewDisabled = false;
      }
    })
  }

  addInsatnce() {
    this.crudService.addOrEdit(null);
  }

  viewInstanceDetails() {
    this.router.navigate(['dynatrace'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['dynatrace'], { relativeTo: this.route });
  }
}
