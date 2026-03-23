import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { Observable, Subject, of } from 'rxjs';
import { EDIT_DATA_CENTERS, ADD_DATA_CENTERS } from '../api-endpoint.const';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DcCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  addOrEditDataCenter(dcId: string) {
    this.addOrEditAnnouncedSource.next(dcId);
  }

  deleteDataCenter(dcId: string) {
    this.deleteAnnouncedSource.next(dcId);
  }

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

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

  buildForm(dcId: string): Observable<FormGroup> {
    this.resetFormErrors();
    if (dcId) {
      return this.http.get<DataCenter>(EDIT_DATA_CENTERS(dcId)).pipe(
        map(dc => {
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
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'searchlocation': ['', [Validators.required]],
        'location': ['', [RxwebValidators.compare({ fieldName: 'searchlocation' })]],
        'lat': ['', RxwebValidators.required({
          conditionalExpression: (x: any) =>
            x.location && x.lat == '' && x.long == ''
        })],
        'long': ['']
      }));
    }
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
