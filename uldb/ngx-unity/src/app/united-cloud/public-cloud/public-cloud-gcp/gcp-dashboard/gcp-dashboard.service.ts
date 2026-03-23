import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_GCP_ACCOUNTS, GET_GCP_REGIONS, DELETE_GCP_ACCOUNT, ADD_GCP_ACCOUNT, EDIT_GCP_ACCOUNT, UPDATE_GCP_BILLING_DETAILS, GET_GCP_BILLING_ACCOUNTS, GET_GCP_BILLING_DATASETS, UPDATE_GCP_SUSTAINABILITY_DETAILS } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoWhitespaceValidator, EmailValidator } from 'src/app/shared/app-utility/app-utility.service';
import { gcpRegions } from '../../region.const';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable()
export class PublicCloudGCPDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getGCPAcccounts(): Observable<PaginatedResult<GCPAccount>> {
    return this.http.get<PaginatedResult<GCPAccount>>(GET_GCP_ACCOUNTS());
  }

  getRegions(): Observable<Region[]> {
    return of(gcpRegions);
  };

  convertToViewData(accounts: GCPAccount[]): GCPAccountViewData[] {
    let viewData: GCPAccountViewData[] = [];
    accounts.map(account => {
      let data = new GCPAccountViewData();
      data.name = account.name;
      data.email = account.email;
      data.projectId = account.project_id;
      data.selectedRegion = '';
      data.uuid = account.uuid;
      data.billingEnabled = account.billing_enabled;
      data.billingAccount = account.billing_account;
      data.billingDataset = account.dataset;
      data.isBillingExists = account.project_id.indexOf('istio') > -1 ? true : false;
      data.co2EmissionEnabled = account.co2emission_enabled;
      if (data.isBillingExists) {
        data.billingTooltip = `Add Billing Details`;
      } else {
        data.billingTooltip = `Billing Not Enabled`;
      }
      if (data.co2EmissionEnabled) {
        data.sustainabilityTooltip = `Add Sustainability Details`;
      } else {
        data.sustainabilityTooltip = `Sustainability Not Enabled`;
      }
      viewData.push(data);
    });
    return viewData;
  }

  getGCPBillingDatasets(uuid: string): Observable<string[]> {
    return this.http.get<string[]>(GET_GCP_BILLING_DATASETS(uuid));
  }

  getGCPBillingAccounts(uuid: string): Observable<GCPBillingInfo> {
    return this.http.get<GCPBillingInfo>(GET_GCP_BILLING_ACCOUNTS(uuid));
  }

  resetBillingFormErrors(): any {
    let formErrors = {
      'name': '',
      'billing_account': '',
      'dataset': '',
    };
    return formErrors;
  }

  billingFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'billing_account': {
      'required': 'Billing Account is required',
    },
    'dataset': {
      'required': 'Dataset is required',
    }
  };

  buildBillingForm(input: GCPAccountViewData): FormGroup {
    return this.builder.group({
      'uuid': [input.uuid],
      'name': [input.name, [Validators.required, NoWhitespaceValidator]],
      'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
      'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
    });
  }

  resetSustainabilityFormErrors(): any {
    let formErrors = {
      'name': '',
      'billing_account': '',
      'dataset': '',
    };
    return formErrors;
  }

  sustainabilityFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'billing_account': {
      'required': 'Sustainability Account is required',
    },
    'dataset': {
      'required': 'Dataset is required',
    }
  };

  buildSustainabilityForm(input: GCPAccountViewData): FormGroup {
    return this.builder.group({
      'uuid': [input.uuid],
      'name': [input.name, [Validators.required, NoWhitespaceValidator]],
      'billing_account': [input.billingAccount ? input.billingAccount : '', [Validators.required]],
      'dataset': [input.billingDataset ? input.billingDataset : '', [Validators.required]],
    });
  }

  updateBillingDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
    return this.http.put(UPDATE_GCP_BILLING_DETAILS(data.uuid), data);
  }

  updateSustanabilityDetails(data: { uuid: string, name: string, billing_account: string, dataset: string }) {
    return this.http.put(UPDATE_GCP_SUSTAINABILITY_DETAILS(data.uuid), data);
  }
}

export class GCPAccountViewData {
  constructor() { }
  name: string;
  email: string;
  projectId: string;
  uuid: string;
  selectedRegion: string;
  billingEnabled: boolean;
  billingAccount: string;
  billingDataset: string;
  isBillingExists: boolean;
  billingTooltip: string;
  co2EmissionEnabled: boolean;
  sustainabilityTooltip: string;
}