import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { UsiEventIngestionAwsCrudService } from '../usi-event-ingestion-aws-crud/usi-event-ingestion-aws-crud.service';

@Component({
  selector: 'usi-event-ingestion-aws-widget',
  templateUrl: './usi-event-ingestion-aws-widget.component.html',
  styleUrls: ['./usi-event-ingestion-aws-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiEventIngestionAwsWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/amazon-web-services.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: UsiEventIngestionAwsCrudService) { }

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
    this.router.navigate(['aws'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['aws'], { relativeTo: this.route });
  }

}
