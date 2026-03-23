import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataCenter, DataCenterTabs } from './tabs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DATA_CENTERS, ADD_DATA_CENTERS, EDIT_DATA_CENTERS } from 'src/app/shared/api-endpoint.const';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable()
export class DatacenterService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }
  getDataCenters(): Observable<DataCenterTabs[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: params })
      .pipe(map((data: DataCenter[]) => {
        let pcTabs: DataCenterTabs[] = [];
        data.forEach(pc => {
          let pcTab: DataCenterTabs = pc;
          pcTab.url = '/unitycloud/datacenter/' + pc.uuid;
          pcTabs.push(pcTab);
        });
        return pcTabs;
      }));
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'searchlocation': '',
      'location': '',
      'lat': '',
      'long': ''
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'searchlocation': {
      'required': 'Location is required',
    },
    'location': {
      'compare': 'Please select a valid location'
    },
    'lat': {
      'required': 'Please select a valid location'
    },
    'long': {
    }
  };

  buildForm(dc: DataCenter): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'name': [dc ? dc.name : '', [Validators.required, NoWhitespaceValidator]],
      'searchlocation': [dc ? dc.location : '', [Validators.required]],
      'location': [dc ? dc.location : '', [RxwebValidators.compare({ fieldName: 'searchlocation' })]],
      'lat': [dc ? dc.lat : '', RxwebValidators.required({
        conditionalExpression: (x: any) =>
          x.location && x.lat == '' && x.long == ''
      })],
      'long': [dc ? dc.long : '']
    });
  }

  saveDatacenter(dcId: string, dc: DataCenter): Observable<DataCenter> {
    if (dcId) {
      return this.http.put<DataCenter>(EDIT_DATA_CENTERS(dcId), dc);
    } else {
      return this.http.post<DataCenter>(ADD_DATA_CENTERS(), dc);
    }
  }

  delete(dcId: string) {
    return this.http.delete(EDIT_DATA_CENTERS(dcId));
  }
}