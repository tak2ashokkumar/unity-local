import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { CustomCloudVMCRUDOS } from '../../../entities/custom-cloud-vm-crud.type';
import { CustomVM } from '../vms-list-custom.service';

@Injectable()
export class VmsListCustomCrudService {
  private addOrEditAnnouncedSource = new Subject<{ pcId: string, deviceId: string }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<{ pcId: string, deviceId: string }>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService) { }

  addOrEdit(pcId: string, deviceId: string) {
    this.addOrEditAnnouncedSource.next({ pcId, deviceId });
  }

  delete(pcId: string, deviceId: string) {
    this.deleteAnnouncedSource.next({ pcId, deviceId });
  }

  getOperatingSystem() {
    return this.http.get<CustomCloudVMCRUDOS[]>('rest/os/?page_size=0');
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  buildDeviceForm(pcId: string, deviceId?: string): Observable<FormGroup> {
    if (deviceId) {
      return this.http.get<CustomVM>(`/customer/virtual_machines/${deviceId}/`).pipe(
        map(cd => {
          let form = this.builder.group({
            'name': [cd.name, [Validators.required, NoWhitespaceValidator]],
            'management_ip': [cd.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'os': this.builder.group({
              'id': [cd.os ? cd.os.id : '', [NoWhitespaceValidator]]
            }),
            // 'private_cloud': [pcId],
            'vm_type': [null],
            'custom_attribute_data': [cd.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [cd.collector ? cd.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'os': this.builder.group({
          'id': ['', [NoWhitespaceValidator]]
        }),
        'private_cloud': [pcId],
        'vm_type': [null]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
  }

  resetDeviceFormErrors() {
    return {
      'name': '',
      'management_ip': '',
      'os': {
        'id': ''
      },
      'collector': {
        'uuid': ''
      }
    };
  }

  deviceFormValidationMessages = {
    'name': {
      'required': 'Virtual Machine name is required'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'os': {
      'id': {
        'required': 'OS is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  createDevice(formData: any): Observable<any[]> {
    return this.http.post<any[]>(`/customer/virtual_machines/`, formData);
  }

  updateDevice(formData: any, deviceId: string): Observable<any[]> {
    return this.http.put<any[]>(`/customer/virtual_machines/${deviceId}/`, formData);
  }

  deleteDevice(deviceId: string): Observable<any> {
    return this.http.delete(`/customer/virtual_machines/${deviceId}/`);
  }
}
