import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import moment, { Moment } from 'moment';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UnitySetupBudgetCrudService {

  constructor(
    private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService
  ) { }

  getCloudData(): Observable<CloudAccountsType[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('is_managed', 'True')
    return this.http.get<CloudAccountsType[]>(`customer/cloud_fast/`, { params: params });
  }

  getBudgetData(id: string): Observable<BudgetInstance> {
    return this.http.get<BudgetInstance>(`customer/budget/${id}/`);
  }

  buildForm(data: BudgetInstance): FormGroup {
    if (data) {
      let form = this.builder.group({
        'uuid': [data.uuid],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [Validators.required, NoWhitespaceValidator]],
        'scope': [data.scope, [Validators.required, NoWhitespaceValidator]],
        'cloud_type': [data.cloud_type, [Validators.required, NoWhitespaceValidator]],
        'period': [data.period, [Validators.required, NoWhitespaceValidator]],
        'period_selection_start': [this.setPeriodDates(data.period, data.period_selection_start), [Validators.required, NoWhitespaceValidator]],
        'period_selection_end': [this.setPeriodDates(data.period, data.period_selection_end), [Validators.required, NoWhitespaceValidator]],
        'invoice': [data.invoice],
        'budget_amount': this.setBudgetFields(data.budget_amount),
        'same_for_all': [data.same_for_all ? data.same_for_all : false],
        'same_for_all_amount': [data.same_for_all ? data.same_for_all_amount : { value: '', disabled: true }],
        'status': [data.status],
      }, {
        validators: [
          periodDatesValidator('period_selection_start', 'period_selection_end', 'period'),
        ]
      });
      if (data.same_for_all) {
        form.get('same_for_all_amount').setValidators([Validators.required, NoWhitespaceValidator])
      }
      if (data.scope == 'Cloud Account') {
        form.addControl('cloud_uuid', new FormControl(data.cloud_account ? data.cloud_account?.uuid : '', [Validators.required, NoWhitespaceValidator]));
      }
      return form;
    } else {
      // Default form for new instance creation
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'scope': ['', [Validators.required, NoWhitespaceValidator]],
        'period': ['Year', [Validators.required, NoWhitespaceValidator]],
        'period_selection_start': ['', [Validators.required, NoWhitespaceValidator]],
        'period_selection_end': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'same_for_all': [false],
        'same_for_all_amount': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'status': [true],
      }, {
        validators: [
          periodDatesValidator('period_selection_start', 'period_selection_end', 'period'),
        ]
      });
    }
  }

  setPeriodDates(period: string, date: string) {
    if (date && period) {
      switch (period) {
        case 'Year':
        case 'Custom':
          return moment(date).format('YYYY-MM-DD 00:00:00');
        case 'Quarter':
          return quarters.find(q => q.order == moment(date).quarter()).value;
        case 'Month':
          return moment(date).format('MMM');
        default: return;
      }
    }
  }

  setBudgetFields(json: any) {
    let budget = this.builder.group({});
    this.budgetValidationMessages = {};
    this.budgetErrors = {};
    Object.keys(json).forEach(obj => {
      if (typeof json[obj] === "object") {
        const error = {};
        const errorMsg = {};
        const subGroup = this.builder.group({});
        Object.keys(json[obj]).forEach(subObj => {
          subGroup.addControl(subObj, new FormControl(json[obj][subObj], [Validators.required, NoWhitespaceValidator]));
          errorMsg[subObj] = { 'required': 'Amount required' };
          error[subObj] = '';
        });
        budget.addControl(obj, subGroup);
        this.budgetValidationMessages[obj] = errorMsg;
        this.budgetErrors[obj] = error;
      } else {
        budget.addControl(obj, new FormControl(json[obj], [Validators.required, NoWhitespaceValidator]));
        this.budgetValidationMessages[obj] = { 'required': 'Amount required' };
        this.budgetErrors[obj] = '';
      }
    });
    return budget;
  }

  formatFormData(rawValue: any): BudgetInstance {
    // Check if period is not 'Quarter' or 'Month'
    if (rawValue.period !== 'Quarter' && rawValue.period !== 'Month') {

      const formattedStart = rawValue.period_selection_start
        ? moment(rawValue.period_selection_start).format('YYYY-MM-DD 00:00:00')
        : null;

      const formattedEnd = rawValue.period_selection_end
        ? moment(rawValue.period_selection_end).format('YYYY-MM-DD 00:00:00')
        : null;

      return {
        ...rawValue,
        period_selection_start: formattedStart,
        period_selection_end: formattedEnd
      };
    }

    // If the period is 'Quarter' or 'Month', return rawValue unchanged
    return rawValue;
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'scope': '',
      'cloud_type': '',
      'cloud_uuid': '',
      'period': '',
      'period_selection_start': '',
      'period_selection_end': '',
      'invoice': '',
      'budget_amount': '',
      'status': '',
      'same_for_all_amount': ''
    };
  }

  budgetErrors = {};

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'scope': {
      'required': 'Scope is required'
    },
    'cloud_type': {
      'required': 'Cloud type is required'
    },
    'cloud_uuid': {
      'required': 'Cloud selection is required'
    },
    'period': {
      'required': 'Period is required'
    },
    'period_selection_start': {
      'required': 'Period start selection is required',
      'owlDateTimeMin': 'Invalid Date Selection',
      // 'owlDateTimeMax': 'End date exceeds the maximum allowed range',


    },
    'period_selection_end': {
      'required': 'Period end selection is required',
      'owlDateTimeMin': 'End date should be greater than start date',
      'owlDateTimeMax': 'End date exceeds the maximum allowed range',
    },
    'invoice': {
      'required': 'Invoice is required',
    },
    'budget_amount': {
      'required': 'Budget is required',
    },
    'status': {
      'required': 'Status is required',
    },
    'same_for_all_amount': {
      'required': 'Amount is required',
    },
  };

  budgetValidationMessages = {};

  createBudget(data: BudgetInstance) {
    return this.http.post(`customer/budget/`, data);
  }

  updateBudget(data: BudgetInstance, id: string) {
    return this.http.put(`customer/budget/${id}/`, data);
  }
}

export const quarterOrder = {
  'Q1': 1,
  'Q2': 2,
  'Q3': 3,
  'Q4': 4
};

export const quarters = [
  { name: 'Quarter 1', value: 'Q1', order: 1, startMonth: 1, endMonth: 3 },
  { name: 'Quarter 2', value: 'Q2', order: 2, startMonth: 4, endMonth: 6 },
  { name: 'Quarter 3', value: 'Q3', order: 3, startMonth: 7, endMonth: 9 },
  { name: 'Quarter 4', value: 'Q4', order: 4, startMonth: 10, endMonth: 12 }
];

export const months = [
  { name: 'January', value: 'Jan', order: 1, quarter: 1 },
  { name: 'February', value: 'Feb', order: 2, quarter: 1 },
  { name: 'March', value: 'Mar', order: 3, quarter: 1 },
  { name: 'April', value: 'Apr', order: 4, quarter: 2 },
  { name: 'May', value: 'May', order: 5, quarter: 2 },
  { name: 'June', value: 'Jun', order: 6, quarter: 2 },
  { name: 'July', value: 'Jul', order: 7, quarter: 3 },
  { name: 'August', value: 'Aug', order: 8, quarter: 3 },
  { name: 'September', value: 'Sep', order: 9, quarter: 3 },
  { name: 'October', value: 'Oct', order: 10, quarter: 4 },
  { name: 'November', value: 'Nov', order: 11, quarter: 4 },
  { name: 'December', value: 'Dec', order: 12, quarter: 4 },
];

export const scopeConst = [{ label: 'Cloud Type', value: 'Cloud' }, { label: 'Cloud Account', value: 'Cloud Account' }]; //['Cloud Type', 'Group', 'Tag', 'Organization'];
export const cloudTypeConst = ['Azure', 'AWS', 'GCP', 'OCI', 'OpenStack', 'VMware', 'United Private Cloud vCenter', 'ESXi', 'Custom', 'vCloud Director', 'Proxmox', 'G3 KVM', 'Hyperv'];

export const periodDatesValidator = (startField: string, endField: string, peroid: string) => {
  return (group: FormGroup): ValidationErrors | null => {
    const period = group.get(peroid);
    switch (period.value) {
      case 'Year':
      case 'Custom':
        break;
      case 'Quarter':
        const startQuarter = group.get(startField)?.value;
        const endQuarter = group.get(endField)?.value;
        if (startQuarter && endQuarter) {
          // Compare start and end quarters using quarterOrder
          if (quarterOrder[startQuarter] > quarterOrder[endQuarter]) {
            return { quarterInvalid: true };
          }
        }
        break;
      case 'Month':
        const startMonth = group.get(startField)?.value;
        const endMonth = group.get(endField)?.value;
        if (startMonth && endMonth) {
          const startIndex = months.findIndex(month => month.value === startMonth);
          const endIndex = months.findIndex(month => month.value === endMonth);
          // Compare the indices of the months
          if (startIndex > endIndex) {
            return { monthInvalid: true }; // Validation error
          }
        }
        break;
      default: return null; // No errors
    }
  };
};

export interface BudgetInstance {
  uuid?: string;
  name: string;
  description: string;
  scope: string;
  // cloud_id: number;
  cloud_account: CloudAccount;
  cloud_type: string;
  cloud_uuid: string;
  period: string;
  period_selection_start: string;
  period_selection_end: string;
  invoice: string;
  same_for_all: boolean;
  same_for_all_amount: number;
  budget_amount: BudgetAmount[];
  status: boolean;
  created_by: CreatedBy;
  updated_by: CreatedBy;
  // customer: number;
  total_budget: number;
  budget_amount_detail: BudgetAmountDetail[];
}

interface BudgetAmount {
  [key: string]: number;
}

interface CreatedBy {
  url: string;
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  access_types: string[];
  user_roles: string[];
  last_login: string;
}

interface CloudAccount {
  name: string;
  uuid: string;
}
interface BudgetAmountDetail {
  amount: string;
  difference: string;
  name: string;
  spent: string;
}

export interface CloudAccountsType {
  id: number;
  vms: number;
  cloud_type: string;
  uuid: string;
  account_name: string;
  name?: string;
  platform_type?: string;
  device_count?: number;
  storage?: string;
  memory?: number;
  colocation_cloud?: string;
  display_platform?: string;
  vm_url?: string;
}

export interface cloudImgDropdownType {
  image: string;
  text: string;
}