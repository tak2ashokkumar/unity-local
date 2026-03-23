import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CurrencyObjType, NgSelectDropdownType } from '../unity-setup-finops.type';

@Injectable({
  providedIn: 'root'
})
export class UsfBasicService {

  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  customNgSelectValues: NgSelectDropdownType;

  constructor(private builder: FormBuilder) { }

  createForm(d: any) {
    this.buildForm(d)
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(obj?: any) {
    if (obj) {
      this.form = this.builder.group({
        'business_unit': [obj.business_unit, [Validators.required]],
        'license_cost_center': [obj.license_cost_center, [Validators.required]],
        'tags': [obj.tags],
        'environment': [obj.environment, [Validators.required]],
        'workload_type': [obj.workload_type],
        'host_deployment_type': [obj.host_deployment_type],
        'virtualization_type': [obj.virtualization_type],
        'service': [obj.service, [Validators.required]],
        'building_block_code': [obj.building_block_code, [Validators.required]],
        'description': [obj.description],
        'license_model': [obj.license_model, [Validators.required]],
        'license_cost_per_core_vm': [obj.license_cost_per_core_vm],
        'purchase_cost_per_server': [obj.purchase_cost_per_server],
        'maintenance_cost_per_host': [obj.maintenance_cost_per_host],
        'billing_currency': [obj.billing_currency, [Validators.required]],
        'budget_amount': [obj.budget_amount],
        'budget_period': [obj.budget_period],
        'allocation_type': [obj.allocation_type, [Validators.required]],
        'allocation_strategy': [obj.allocation_strategy, [Validators.required]],
      });
    } else {
      this.form = this.builder.group({
        'business_unit': [null, [Validators.required]],
        'license_cost_center': [null, [Validators.required]],
        'tags': [null],
        'environment': [null, [Validators.required]],
        'workload_type': [null],
        'host_deployment_type': [null],
        'virtualization_type': [null],
        'service': [null, [Validators.required]],
        'building_block_code': [null, [Validators.required]],
        'description': [null],
        'license_model': [null, [Validators.required]],
        'license_cost_per_core_vm': [null],
        'purchase_cost_per_server': [null],
        'maintenance_cost_per_host': [null],
        'billing_currency': [null, [Validators.required]],
        'budget_amount': [null],
        'budget_period': [null],
        'allocation_type': [null, [Validators.required]],
        'allocation_strategy': [null, [Validators.required]],
      });
    }
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getFormValue() {
    return this.form.getRawValue();
  }

  updateCustomDropdownValues(fields: NgSelectDropdownType) {
    this.customNgSelectValues = fields;
  }

  getCustomDropdownValues(){
    return this.customNgSelectValues;
  }

  resetFormErrors() {
    return {
      'business_unit': '',
      'license_cost_center': '',
      // 'tags': '',
      'environment': '',
      'service': '',
      'building_block_code': '',
      'description': '',
      'license_model': '',
      // 'license_cost_per_core_vm': '',
      // 'purchase_cost_per_server': '',
      // 'maintenance_cost_per_host': '',
      'billing_currency': '',
      // 'budget_amount': '',
      // 'budget_period': '',
      'allocation_type': '',
      'allocation_strategy': ''
    }
  }

  formValidationMessages = {
    'business_unit': {
      'required': 'Business Unit is required',
    },
    'license_cost_center': {
      'required': 'License Cost Center is required',
    },
    // 'tags': {
    //   'required': 'Tags are required',
    // },
    'environment': {
      'required': 'Environment is required',
    },
    'service': {
      'required': 'Applications/Services are required',
    },
    'building_block_code': {
      'required': 'Building Block Code is required',
    },
    'description': {
      'required': 'Description is required',
    },
    'license_model': {
      'required': 'License Model is required',
    },
    // 'license_cost_per_core_vm': {
    //   'required': 'License Cost Per Core/VM is required',
    // },
    // 'purchase_cost_per_server': {
    //   'required': 'Purchase Cost Per Server is required',
    // },
    // 'maintenance_cost_per_host': {
    //   'required': 'Support/Maintenance Cost Per Host is required',
    // },
    'billing_currency': {
      'required': 'Billing Currency is required',
    },
    // 'budget_amount': {
    //   'required': 'Budget Amount is required',
    // },
    // 'budget_period': {
    //   'required': 'Budget Period is required',
    // },
    'allocation_type': {
      'required': 'Allocation Type is required',
    },
    'allocation_strategy': {
      'required': 'Allocation Strategy is required',
    }
  }

}

// export const LicenseCostCenters = ['Network Ops', 'Security']; //+add
// export const Environments = ['Dev', 'Test', 'Prod'];
// export const WorkloadTypes = ['Web', 'Database', 'App', 'Management', 'Network'];//+add
// export const HostDeploymentTypes = ['Container', 'Virtual', 'Physical'];
// export const VirtualizationTypes = ['Vmware', 'KVM', 'Hyperv'];//+add
// export const Services = [];//+add
// export const LicenseModels = ['BYOL', 'PAYG', 'Subscription'];
export const Currencies: CurrencyObjType[] = [
  { 'name': 'USD', 'disabled': false },
  { 'name': 'EURO', 'disabled': true },
  { 'name': 'RIYADH',  'disabled': true }
];
// export const BudgetPeriods = ['Hourly', 'Monthly'];
// export const AllocationTypes = ['Shared', 'Dedicated'];
// export const AllocationStrategies = ['Fixed %', 'Split %'];