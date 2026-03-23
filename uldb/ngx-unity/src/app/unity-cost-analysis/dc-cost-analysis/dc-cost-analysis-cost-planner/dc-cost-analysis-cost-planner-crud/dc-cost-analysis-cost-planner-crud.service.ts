import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DATACENTER_ADD_COST_PLANNER, DEVICES_FAST_BY_DEVICE_TYPE, EDIT_COST_PLANNER, GET_COST_PLANNER, PDU_POWER_CIRCUITS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PDUCRUDPowerCircuit } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { CostPlannerEntityDataType, CostPlannerPowerEntityDataType, DatacenterCostPlannerDataType, DatacenterListDatatype } from '../dc-cost-analysis-cost-planner.type';

@Injectable()
export class DcCostAnalysisCostPlannerCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService) { }

  getDataCenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getPowerCircuits(): Observable<PDUCRUDPowerCircuit[]> {
    return this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
  }

  getFilterDropdownData() {
    return forkJoin<DatacenterFast[], PDUCRUDPowerCircuit[]>(
      this.getDataCenters().pipe(catchError(error => of(undefined))),
      this.getPowerCircuits().pipe(catchError(error => of(undefined))),
    )
  }

  getCostPlannerData(uuid: string) {
    return this.http.get<DatacenterCostPlannerDataType>(GET_COST_PLANNER(uuid));
  }

  convertToDataCenterViewData(datacenters: DatacenterListDatatype[]) {
    let viewData: DatacenterViewData[] = [];
    datacenters.map(dc => {
      let a: DatacenterViewData = new DatacenterViewData();
      a.id = dc.id;
      a.uuid = dc.uuid;
      a.name = dc.name;
      viewData.push(a);
    })
    return viewData;
  }

  buildForm(data: DatacenterCostPlannerDataType): FormGroup {
    if (data) {
      let dcs: number[] = [];
      data.datacenter.forEach(dc => dcs.push(dc.id));
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [Validators.required, NoWhitespaceValidator]],
        'datacenter': [dcs, [Validators.required]],
        'annual_escalation': [data.annual_escalation, [NoWhitespaceValidator]],
        'contract_start_date': [data.contract_start_date, [Validators.required, NoWhitespaceValidator]],
        'contract_end_date': [data.contract_end_date, [Validators.required, NoWhitespaceValidator]],
        'cabinet': this.buildEntityFormArray(data.cabinet),
        // 'bandwidth': this.buildEntityFormArray(data.bandwidth),
        // 'ipv4': this.buildEntityFormArray(data.ipv4),
        'power': this.buildPowerFormArray(data.power),
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'datacenter': [[], [Validators.required]],
        'annual_escalation': [, [NoWhitespaceValidator]],
        'contract_start_date': ['', [Validators.required, NoWhitespaceValidator]],
        'contract_end_date': ['', [Validators.required, NoWhitespaceValidator]],
        'cabinet': this.builder.array([
          this.builder.group({
            entity: ['Cabinet'],
            entity_type: ['', [Validators.required]],
            unit_cost: [, [Validators.required, NoWhitespaceValidator]],
          })
        ]),
        // 'bandwidth': this.builder.array([
        //   this.builder.group({
        //     entity: ['Bandwidth'],
        //     entity_type: ['', [Validators.required]],
        //     unit_cost: [, [Validators.required, NoWhitespaceValidator]],
        //   }),
        // ]),
        // 'ipv4': this.builder.array([
        //   this.builder.group({
        //     entity: ['IPV4'],
        //     entity_type: ['', [Validators.required]],
        //     unit_cost: [, [Validators.required, NoWhitespaceValidator]],
        //   }),
        // ]),
        'power': this.builder.array([
          this.builder.group({
            entity: ['Power'],
            entity_type: ['', [Validators.required]],
            unit_cost: [, [Validators.required, NoWhitespaceValidator]],
            pdu_redundant_flag: [false, [NoWhitespaceValidator]],
            pdu_redundant_cost: [, [NoWhitespaceValidator]],
          }),
        ]),
      });
    }
  }

  private buildEntityFormArray(data: CostPlannerEntityDataType[]): FormArray {
    return this.builder.array(
      data.map(entity => this.builder.group({
        id: [entity.id],
        entity_type: [entity.entity_type, [Validators.required, NoWhitespaceValidator]],
        unit_cost: [entity.unit_cost, [Validators.required, NoWhitespaceValidator]],
      }))
    );
  }

  private buildPowerFormArray(data: CostPlannerPowerEntityDataType[]): FormArray {
    return this.builder.array(
      data.map(power => this.builder.group({
        id: [power.id],
        entity: ['Power'],
        entity_type: [power.entity_type, [Validators.required]],
        unit_cost: [power.unit_cost, [Validators.required, NoWhitespaceValidator]],
        pdu_redundant_flag: [power.pdu_redundant_flag, [NoWhitespaceValidator]],
        pdu_redundant_cost: [power.pdu_redundant_cost, [NoWhitespaceValidator]],
      }))
    );
  }

  resetPlannerFormErrors() {
    return {
      'name': '',
      'description': '',
      'datacenter': '',
      'annual_escalation': '',
      'contract_start_date': '',
      'contract_end_date': '',
      'fromAfterTo': '',
      'cabinet': [this.getEntityFormErrors()],
      'bandwidth': [this.getEntityFormErrors()],
      'ipv4': [this.getEntityFormErrors()],
      'power': [this.getPowerFormErrors()]
    }
  }

  getEntityFormErrors() {
    return {
      entity_type: '',
      unit_cost: ''
    }
  }

  getPowerFormErrors() {
    return {
      entity_type: '',
      unit_cost: '',
      pdu_redundant_flag: false,
      pdu_redundant_cost: '',
    }
  }

  plannerValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'datacenter': {
      'required': 'Datacenter is required'
    },
    'annual_escalation': {
      'max': 'Max value should be less than or equal to 100%',
    },
    'contract_start_date': {
      'required': 'Contract start date is required',
      'owlDateTimeMax': 'Start date cannot be after end date'
    },
    'contract_end_date': {
      'required': 'Contract end date is required',
      'owlDateTimeMin': 'End date cannot be before start date'
    },
    'cabinet': {
      'entity': {
        'required': 'Cabinet entity is required'
      },
      'entity_type': {
        'required': 'Cabinet entity type is required'
      },
      'unit_cost': {
        'required': 'Cabinet unit cost is required'
      }
    },
    'bandwidth': {
      'entity': {
        'required': 'Bandwidth entity is required'
      },
      'entity_type': {
        'required': 'Bandwidth entity type is required'
      },
      'unit_cost': {
        'required': 'Bandwidth unit cost is required'
      }
    },
    'ipv4': {
      'entity': {
        'required': 'Ipv4 entity is required'
      },
      'entity_type': {
        'required': 'Ipv4 entity type is required'
      },
      'unit_cost': {
        'required': 'Ipv4 unit cost is required'
      }
    },
    'power': {
      'entity': {
        'required': 'Power entity is required'
      },
      'entity_type': {
        'required': 'Power entity type is required'
      },
      'unit_cost': {
        'required': 'Power unit cost is required'
      },
      // 'pdu_redundant_flag': {
      //   'required': 'Power PDU redundant flag is required'
      // },
      // 'pdu_redundant_cost': {
      //   'required': 'Power PDU redundant cost is required'
      // }
    }
  }

  createCostPlanner(data: any) {
    return this.http.post(DATACENTER_ADD_COST_PLANNER(), data);
  }

  updateCostplanner(uuid: string, data: any) {
    return this.http.put<DatacenterCostPlannerDataType>((EDIT_COST_PLANNER(uuid)), data);
  }

}

export class DatacenterViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
}
