import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OracleAccountResourceDetailsViewData, UsiPublicCloudOracleResourceDataService } from './usi-public-cloud-oracle-resource-data.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usi-public-cloud-oracle-resource-data',
  templateUrl: './usi-public-cloud-oracle-resource-data.component.html',
  styleUrls: ['./usi-public-cloud-oracle-resource-data.component.scss'],
  providers: [UsiPublicCloudOracleResourceDataService]
})
export class UsiPublicCloudOracleResourceDataComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  instanceId: string;
  resourceId: string;
  viewData: OracleAccountResourceDetailsViewData;

  constructor(private svc: UsiPublicCloudOracleResourceDataService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
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
    this.viewData = null;
    this.svc.getResourceData(this.instanceId, this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get details. Please try again!!'));
    })
  }

  goBack() {
    const currentUrl: string = window.location.href;
    if (currentUrl.includes("integration")) {
      this.router.navigate(['oracle', this.instanceId, 'resources'], { relativeTo: this.route.parent });
    } else if (currentUrl.includes("publiccloud")) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    }
  }
}
