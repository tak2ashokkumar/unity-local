import { Component, OnDestroy, OnInit } from '@angular/core';
import { GCPAccountResourceDetailsViewData, UsiPublicCloudGcpResourceDataService } from './usi-public-cloud-gcp-resource-data.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-public-cloud-gcp-resource-data',
  templateUrl: './usi-public-cloud-gcp-resource-data.component.html',
  styleUrls: ['./usi-public-cloud-gcp-resource-data.component.scss'],
  providers: [UsiPublicCloudGcpResourceDataService]
})
export class UsiPublicCloudGcpResourceDataComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  instanceId: string;
  resourceId: string;

  viewData: GCPAccountResourceDetailsViewData;
  constructor(private svc: UsiPublicCloudGcpResourceDataService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
      this.resourceId = params.get('resourceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getResourceData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getResourceData();
  }

  getResourceData() {
    this.svc.getResourceData(this.instanceId, this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = null;
      this.spinner.stop('main');
    })
  }

  goBack() {
    const currentUrl: string = window.location.href;
    if (currentUrl.includes("integration")) {
      this.router.navigate(['gcp', 'instances', this.instanceId, 'resources'], { relativeTo: this.route.parent });
    } else if (currentUrl.includes("publiccloud")) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    }
  }
}
