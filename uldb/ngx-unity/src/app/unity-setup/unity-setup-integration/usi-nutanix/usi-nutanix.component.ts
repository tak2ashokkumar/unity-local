import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PcCrudService } from 'src/app/shared/pc-crud/pc-crud.service';
import { UsiNutanixService } from './usi-nutanix.service';

@Component({
  selector: 'usi-nutanix',
  templateUrl: './usi-nutanix.component.html',
  styleUrls: ['./usi-nutanix.component.scss'],
  providers: [UsiNutanixService]
})
export class UsiNutanixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  count: number = 0;
  viewData: PrivateClouds[] = [];
  constructor(private svc: UsiNutanixService,
    private crudSvc: PcCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getInstances();
  }

  getInstances() {
    this.svc.getInstances().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      res = res?.filter(c => c.platform_type == 'Nutanix');
      this.count = res?.length;
      this.viewData = res;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  edit(view: PrivateClouds) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteInstance(view: PrivateClouds) {
    this.crudSvc.delete(view.uuid);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }


  viewDevices(view: PrivateClouds) {
    this.router.navigate([view.uuid, 'discovery'], { relativeTo: this.route });
  }
}