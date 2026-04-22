import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DatacenterFast } from '../../shared/SharedEntityTypes/datacenter.type';
import { UnityCollectorType } from '../../shared/SharedEntityTypes/collector.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS } from '../../shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from '../../shared/app-utility/app-utility.service';
import { PureStorageCrudFormdata, UnityOneStorageDevice } from '../../shared/SharedEntityTypes/inventory/storage.type';

@Injectable({
  providedIn: 'root'
})
export class UsiPureStorageCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(storageId: string) {
    this.addOrEditAnnouncedSource.next(storageId);
  }

  delete(storageId: string) {
    this.deleteAnnouncedSource.next(storageId);
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCollectors() {
    return this.http.get<UnityCollectorType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', '0') });
  }

  getDetails(storageId: string): Observable<UnityOneStorageDevice> {
    return this.http.get<UnityOneStorageDevice>(`customer/pure_storage/${storageId}/`);
  }

  buildForm(data: UnityOneStorageDevice): FormGroup {
    if (data) {
      let form = this.builder.group({
        'uuid': [data.uuid],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'datacenter': this.builder.group({
          'uuid': [data.datacenter.uuid, [Validators.required, NoWhitespaceValidator]]
        }),
        'is_purity': [data.is_purity, [Validators.required, NoWhitespaceValidator]],
        'host_url': [data.host_url, [Validators.required, NoWhitespaceValidator]],
        'username': [data.username, [Validators.required, NoWhitespaceValidator]],
        'password': [data.password, [Validators.required, NoWhitespaceValidator]],
        'port': [data.port, [NoWhitespaceValidator]],
        'monitor': [false],
        'mtp_templates': [[],],
        'collector': this.builder.group({
          'uuid': [data.collector ? data.collector.uuid : '', [Validators.required]]
        }),
        // 'tags': [data.tags.filter(tg => tg)]
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'is_purity': [true, [Validators.required, NoWhitespaceValidator]],
        'host_url': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'port': [null, [NoWhitespaceValidator]],
        'management_ip': [''],
        'monitor': [false],
        'mtp_templates': [[],],
        'collector': this.builder.group({
          'uuid': ['', [Validators.required]]
        }),
        // 'tags': [[]]
      });
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'datacenter': {
        'uuid': ''
      },
      'is_purity': '',
      'host_url': '',
      'username': '',
      'password': '',
      'port': '',
      'collector': {
        'uuid': ''
      }
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'host_url': {
      'required': 'Host URL is required'
    },
    'username': {
      'required': 'Username is required',
    },
    'password': {
      'required': 'Password is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  };

  save(data: PureStorageCrudFormdata, deviceId?: string) {
    if (deviceId) {
      return this.http.put<PureStorageCrudFormdata>(`customer/pure_storage/${deviceId}/`, data);
    } else {
      return this.http.post<PureStorageCrudFormdata>(`customer/pure_storage/`, data);
    }
  }

  deleteDevice(uuid: string) {
    return this.http.delete(`customer/pure_storage/${uuid}/`);
  }
}
