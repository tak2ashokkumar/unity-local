import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MTPSubscription } from 'src/app/shared/SharedEntityTypes/subscriptions.type';
import { Tenant } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MtpDashboardSubscriptionsService } from './mtp-dashboard-subscriptions.service';

@Component({
  selector: 'mtp-dashboard-subscriptions',
  templateUrl: './mtp-dashboard-subscriptions.component.html',
  styleUrls: ['./mtp-dashboard-subscriptions.component.scss'],
  providers: [MtpDashboardSubscriptionsService]
})
export class MtpDashboardSubscriptionsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  tenants: Tenant[] = [];
  tenantForm: FormGroup;
  view: MTPSubscription;
  constructor(private svc: MtpDashboardSubscriptionsService,
    private router: Router,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getTenants();
    });
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTenants() {
    this.spinner.start('dashboard-subscriptions');
    this.svc.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.tenants = res;
        this.buildForm(res.getFirst().uuid);
      } else {
        this.tenants = [];
        this.spinner.stop('dashboard-subscriptions');
      }
    }, err => {
      this.tenants = [];
      this.spinner.stop('dashboard-subscriptions');
    });
  }

  buildForm(tenantId: string) {
    this.tenantForm = this.svc.buildForm(tenantId);
    // console.log('form value : ', this.tenantForm.getRawValue());
    // console.log('tenants : ', this.tenants);
    this.getSubscriptions(tenantId);
    this.tenantForm.get('tenant').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.spinner.start('dashboard-subscriptions');
        this.getSubscriptions(val);
      }
    })
  }

  getSubscriptions(tenantId: string) {
    if (!tenantId) {
      this.view = null;
      this.spinner.stop('dashboard-subscriptions');
      return;
    }
    this.svc.getSubscriptionsByTenant(tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.view = res.getFirst();
      }
      this.spinner.stop('dashboard-subscriptions');
    }, err => {
      this.view = null;
      this.spinner.stop('dashboard-subscriptions');
    });
  }

}
