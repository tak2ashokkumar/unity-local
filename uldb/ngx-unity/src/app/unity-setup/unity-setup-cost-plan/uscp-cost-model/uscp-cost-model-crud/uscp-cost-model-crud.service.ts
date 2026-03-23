import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CostModelInstance, DatacenterListItem } from '../uscp-cost-model.type';

@Injectable()
export class UscpCostModelCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getModelData(costModelId: string): Observable<CostModelInstance> {
    return this.http.get<CostModelInstance>(`customer/cost_plan/private_cost_plan/${costModelId}/`);
  }

  getDatacenters(regions: string[]): Observable<DatacenterListItem[]> {
    let params = new HttpParams();
    regions.forEach(name => {
      params = params.append('region', name);
    });
    return this.http.get<DatacenterListItem[]>(`/customer/cost_plan/private_cost_plan/get_datacenter_by_region`, { params: params });
  }

  getAllDatacenters(data: DatacenterListItem[]): string[] {
    return data.flatMap(entry => entry.datacenters);
  }

  buildForm(data: CostModelInstance): FormGroup {
    if (data) {
      // Edit Mode: Populate form with data
      let form = this.builder.group({
        'plan_name': [data.plan_name, [Validators.required, NoWhitespaceValidator]],
        'plan_description': [data.plan_description, [Validators.required, NoWhitespaceValidator]],
        'regions': [{ value: data.regions, disabled: true }, [Validators.required]],
        'plan_type': [{ value: data.plan_type, disabled: true }, [Validators.required]],
        'disk_type': [data.disk_type],
        'price_unit': [{ value: data.price_unit, disabled: true }, [Validators.required]],
        'price_allocation': [data.price_allocation],
        'datacenters': [{ value: data.datacenters, disabled: true }, [Validators.required]],
        'unit_cost_price': [
          data.unit_cost_price,
          [Validators.required, Validators.min(0), Validators.pattern(/^(\d*\.{0,1}\d{0,4}$)$/)]
        ]
      });

      if (data?.plan_type == 'All At One Price' || data?.plan_type == 'Disk Only') {
        form.get('disk_type').setValidators([Validators.required]);
      }

      return form;
    } else {
      // Create Mode: Disable datacenters field
      return this.builder.group({
        'plan_name': ['', [Validators.required, NoWhitespaceValidator]],
        'plan_description': ['', [Validators.required, NoWhitespaceValidator]],
        'regions': [[], [Validators.required]],
        'plan_type': ['', [Validators.required]],
        'disk_type': [''],
        'price_unit': ['', [Validators.required]],
        'price_allocation': ['Always'],
        'datacenters': [{ value: [], disabled: true }, [Validators.required]], // Disabled in Create Mode
        'unit_cost_price': [10, [Validators.required, Validators.min(0), Validators.pattern(/^(\d*\.{0,1}\d{0,4}$)$/)]]
      });
    }
  }

  resetFormErrors() {
    return {
      'plan_name': '',
      'plan_description': '',
      'plan_type': '',
      'regions': '',
      'disk_type': '',
      'datacenters': '',
      'price_unit': '',
      'price_allocation': '',
      'unit_cost_price': ''
    }
  }

  formValidationMessages = {
    'plan_name': {
      'required': 'Name is required'
    },
    'plan_description': {
      'required': 'Description is required'
    },
    'datacenters': {
      'required': 'Datacenter selection is required'
    },
    'regions': {
      'required': 'Region is required'
    },
    'plan_type': {
      'required': 'Plan type is required'
    },
    'disk_type': {
      'required': 'Disk type is required'
    },
    'price_unit': {
      'required': 'Price unit is required'
    },
    'unit_cost_price': {
      'required': 'Unit cost is required',
      'min': 'Unit cost should be greater than 0',
      'pattern': 'Only 4 decimal points are expected (Ex: 99.9918)'
    }
  }

  createModel(data: CostModelInstance) {
    return this.http.post(`customer/cost_plan/private_cost_plan/`, data);
  }

  updateModel(data: CostModelInstance, costModelId: string) {
    return this.http.put(`customer/cost_plan/private_cost_plan/${costModelId}/`, data);
  }
}
