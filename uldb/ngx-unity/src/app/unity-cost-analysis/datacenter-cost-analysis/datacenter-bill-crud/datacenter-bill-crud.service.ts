import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CREATE_DC_BILL, DC_BILL, PDU_POWER_CIRCUITS, GET_DC_COST_DATA } from 'src/app/shared/api-endpoint.const';
import { DCBillPDUPowerCircuit, DCBillData } from './datacenter-bill-crud.type';
import * as moment from 'moment';
import { CostAnalysisDCList } from '../datacenter-cost-summary/datacenter-cost-summary.type';

@Injectable()
export class DatacenterBillCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  addOrEditBill(billId: string) {
    this.addOrEditAnnouncedSource.next(billId);
  }

  delete(billId: string) {
    this.deleteAnnouncedSource.next(billId);
  }

  getDatacenters(): Observable<CostAnalysisDCList[]> {
    return this.http.get<CostAnalysisDCList[]>(GET_DC_COST_DATA());
  }

  getPowerCircuits(): Observable<DCBillPDUPowerCircuit[]> {
    return this.http.get<DCBillPDUPowerCircuit[]>(PDU_POWER_CIRCUITS());
  }

  createDCBillForm(billId?: string): Observable<FormGroup> {
    if (billId) {
      return this.http.get<DCBillData>(DC_BILL(billId)).pipe(
        map(bill => {
          let form = this.builder.group({
            'datacenters': [[bill.datacenter], [Validators.required]],
            'contract_date': [bill.contract_date, [Validators.required, NoWhitespaceValidator]],
            'cabinet_rental_model': [bill.cabinet_rental_model, [Validators.required, NoWhitespaceValidator]],
            'cabinet_unit_cost': [bill.cabinet_unit_cost, [Validators.required, NoWhitespaceValidator]],
            'power_circuit': this.builder.group({
              'id': [bill.power_circuit ? bill.power_circuit.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'power_circuit_cost': [bill.power_circuit_cost, [Validators.required, NoWhitespaceValidator]],
            'redundant_power': [bill.redundant_power, [Validators.required, NoWhitespaceValidator]],
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'datacenters': [[], [Validators.required]],
        'contract_date': ['', [Validators.required, NoWhitespaceValidator]],
        'cabinet_rental_model': [CabinetRentalModels.FULL_CABINET, [Validators.required, NoWhitespaceValidator]],
        'cabinet_unit_cost': ['', [Validators.required, NoWhitespaceValidator]],
        'power_circuit': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'power_circuit_cost': ['', [Validators.required, NoWhitespaceValidator]],
        'redundant_power': ['', [Validators.required, NoWhitespaceValidator]],
      })).pipe(map(form => {
        return form;
      }));
    }
  }

  resetBillFormErrors() {
    return {
      'datacenters': '',
      'contract_date': '',
      'cabinet_rental_model': '',
      'cabinet_unit_cost': '',
      'power_circuit': {
        'id': ''
      },
      'power_circuit_cost': '',
      'redundant_power': '',
    };
  }

  billFormValidationMessages = {
    'datacenters': {
      'required': 'Datacenter is required'
    },
    'contract_date': {
      'required': 'Contract Date is required'
    },
    'cabinet_rental_model': {
      'required': 'Cabinet Rental model is required'
    },
    'cabinet_unit_cost': {
      'required': 'Cabinet Unit Cost is required'
    },
    'power_circuit': {
      'id': {
        'required': 'Power Circuit is required'
      }
    },
    'power_circuit_cost': {
      'required': 'Power Circuit Cost is required'
    },
    'redundant_power': {
      'required': 'Redundant Power is required'
    },
  }

  createBill(data: any): Observable<any[]> {
    return this.http.post<any[]>(CREATE_DC_BILL(), data);
  }

  updateBill(data: any, billId: string): Observable<any[]> {
    return this.http.put<any[]>(DC_BILL(billId), data);
  }

  deleteBill(billId: string): Observable<any> {
    return this.http.delete(DC_BILL(billId));
  }

}

export enum CabinetRentalModels {
  FULL_CABINET = 'Full Cabinet',
  RU = 'RU'
}