import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MTPSubscription } from 'src/app/shared/SharedEntityTypes/subscriptions.type';
import { Tenant } from 'src/app/shared/SharedEntityTypes/tenants.type';

@Injectable()
export class MtpDashboardSubscriptionsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getTenants() {
    return this.http.get<Tenant[]>(`/customer/mtp/tenant/`);
  }

  buildForm(tenantId: string) {
    return this.builder.group({
      'tenant': [tenantId],
    });
  }

  getSubscriptionsByTenant(tenantId: string) {
    return this.http.get<MTPSubscription[]>(`/customer/mtp/subscriptions/${tenantId}/get_all_org_subscription/`);
  }
}
