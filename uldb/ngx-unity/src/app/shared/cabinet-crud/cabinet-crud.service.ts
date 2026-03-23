import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { ADD_CABINET, EDIT_CABINET, DELETE_CABINET, DATA_CENTERS } from '../api-endpoint.const';
import { Subject, Observable } from 'rxjs';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';

@Injectable({
  providedIn: 'root'
})
export class CabinetCrudService {

  private addOrEditAnnouncedSource = new Subject<{ cabinet: DataCenterCabinet, dcId: string, isBillingCrud: boolean }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  addOrEditCabinet(cabinet: DataCenterCabinet, dcId?: string, isBillingCrud?: boolean) {
    this.addOrEditAnnouncedSource.next({ cabinet: cabinet, dcId: dcId, isBillingCrud: isBillingCrud });
  }

  deleteCabinet(cabinetId: string) {
    this.deleteAnnouncedSource.next(cabinetId);
  }

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }


  getDataCenters(): Observable<DataCenter[]> {
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'model': '',
      'size': '',
      'datacenter': '',
      'contract_end_date': '',
      'cost': '',
      'annual_escalation': '',
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'model': {
      'required': 'Model is required'
    },
    'size': {
      'required': 'Size is required',
      'max': 'Maximum value should be less than or equal to 72',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'datacenter': {
      'required': 'Datacenter is required'
    },
    'contract_end_date': {
      'min': 'Contract end date should be after Start date'
    },
    'cost': {
      'min': 'Cost should be in positive values'
    },
    'annual_escalation': {
      'min': 'Percentage should be in positive values',
      'max': 'Percentage can be maximum of 100'
    }
  };

  buildForm(cabinet: DataCenterCabinet, dcId: string, isBillingCRUD: boolean): FormGroup {
    this.resetFormErrors();
    if (cabinet) {
      return this.builder.group({
        'name': [{ value: cabinet.name, disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]],
        'size': [{ value: cabinet.size, disabled: isBillingCRUD }, [Validators.required, Validators.min(1), Validators.max(72)]],
        'model': [{ value: cabinet.model, disabled: isBillingCRUD }, [Validators.required, NoWhitespaceValidator]],
        'contract_start_date': [cabinet.contract_start_date],
        'contract_end_date': [cabinet.contract_end_date],
        'renewal': [cabinet.renewal],
        'cost': [cabinet.cost, [Validators.min(0)]],
        'annual_escalation': [cabinet.annual_escalation, [Validators.min(0), Validators.max(100)]],
        'tags': [cabinet.tags],
        'datacenter': [dcId ? dcId : '', [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'size': ['', [Validators.required, Validators.min(1), Validators.max(72)]],
        'model': ['', [Validators.required, NoWhitespaceValidator]],
        'contract_start_date': [null],
        'contract_end_date': [null],
        'renewal': [''],
        'cost': [null, [Validators.min(0)]],
        'annual_escalation': [null, [Validators.min(0), Validators.max(100)]],
        'tags': [[]],
        'datacenter': [dcId ? dcId : '', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  addCabinet(cabinet: DataCenterCabinet) {
    return this.http.post(ADD_CABINET(), cabinet);
  }

  updateCabinet(cabinetId: string, cabinet: DataCenterCabinet) {
    return this.http.put(EDIT_CABINET(cabinetId), cabinet);
  }

  delete(cabinetId: string) {
    return this.http.delete(DELETE_CABINET(cabinetId));
  }
}
