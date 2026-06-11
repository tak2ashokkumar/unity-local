import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { GET_TENANT_INFO, MTP_TENANT_TOGGLE } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MtpTenantMgmtOverviewService {

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer) { }

  getTenantInfo(uuid: string): Observable<MtpTenantInfoDataType> {
    return this.http.get<MtpTenantInfoDataType>(GET_TENANT_INFO(uuid));
  }

  convertToViewdata(data: MtpTenantInfoDataType): MtpTenantInfoViewData {
    let viewData: MtpTenantInfoViewData = new MtpTenantInfoViewData;
    viewData.name = data.name;
    viewData.address1 = data.address1;
    viewData.address2 = data.address2;
    viewData.phone = data.phone;
    viewData.city = data.city;
    viewData.state = data.state;
    viewData.location = data.location;
    viewData.postalCode = data.postal_code;
    viewData.country = data.country;
    viewData.domain = data.domain;
    if (data.is_tenant_active) {
      viewData.isTenantActive = data.is_tenant_active;
      viewData.toggleIcon = 'fa-toggle-on';
      viewData.toggleTootipMsg = 'Disable';
    } else {
      viewData.isTenantActive = data.is_tenant_active;
      viewData.toggleIcon = 'fa-toggle-off';
      viewData.toggleTootipMsg = 'Enable';
    }
    viewData.email = data.email;
    viewData.uuid = data.uuid;
    let logo = data._logo ? (data._logo.includes('data:image') ? data._logo : 'data:image/png;base64,' + data._logo) : null;
    viewData.logo = logo ? this.sanitizer.bypassSecurityTrustUrl(logo) : logo;
    return viewData;
  }

  deleteTenant(tenantId: string) {
    return this.http.delete(`/customer/mtp/tenant/${tenantId}/`)
  }

  toggleTennat(tenant: MtpTenantInfoViewData) {
    return this.http.put(MTP_TENANT_TOGGLE(tenant.uuid), { "is_tenant_active": tenant.isTenantActive ? false : true });
  }

}

export class MtpTenantInfoViewData {
  constructor() { }
  name: string;
  phone: string;
  address1: string;
  address2: null;
  city: string;
  state: string;
  postalCode: string;
  // isActive: boolean;
  country: string;
  domain: string;
  email: string;
  uuid: string;
  logo: SafeUrl;
  isTenantActive: boolean;
  location: string;
  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable';
}

export interface MtpTenantInfoDataType {
  name: string;
  phone: string;
  address1: string;
  address2: null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  domain: null;
  location: string;
  email: string;
  unity_modules: number[];
  uuid: string;
  region: number;
  _logo: string;
  is_active: boolean;
  is_tenant_active: boolean;
  mtp_group: null;
  id: number;
  get_grp_by_id: MtpTenantGroupDataType[];
}

export interface MtpTenantGroupDataType {
  name: string;
  id: number;
}