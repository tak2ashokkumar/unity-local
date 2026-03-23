import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { disable } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BuildingBlockListType, DeviceDataType } from '../unity-setup-finops.type';

@Injectable()
export class UsfDeviceMappingService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private iconSvc: DeviceIconService) { }

  getMappedDevicesForBB(uuid: string): Observable<BuildingBlockListType> {
    return this.http.get<BuildingBlockListType>(`/customer/finops/building_blocks/${uuid}/`);
  }

  buildForm(data?: BuildingBlockListType) {
    if(data){
      if(data.device_types){
        let form = this.builder.group({
          'uuid': [data.uuid, [Validators.required]],
          'name': [{ value: data.building_block_code, disabled: true }, [Validators.required, NoWhitespaceValidator]],
          'device_types': [data.device_types, [Validators.required]],
          'devices': [data.devices]
        });
        return form;
      } else {
        return this.builder.group({
          'uuid': [data.uuid, [Validators.required]],
          'name': [{ value: data.building_block_code, disabled: true }, [Validators.required, NoWhitespaceValidator]],
          'device_types': [null, [Validators.required]],
          'devices': [null],
        });
      }
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'device_types': '',
      'devices': ''
    };
    return formErrors;
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'device_types': {
      'required': 'Device type is required'
    },
    'devices': {
      'required': 'Device selection is required'
    }
  };

  getDeviceTypes() {
    return deviceTypes;
  }

  getDevicesByDeviceTypes(criteria: SearchCriteria): Observable<PaginatedResult<DeviceDataType>> {
    return this.tableSvc.getData<PaginatedResult<DeviceDataType>>('/customer/fast/credential_devices/', criteria).pipe(
      map((res: PaginatedResult<DeviceDataType>) => {
        res.results.forEach(d => {
          d.deviceIcon = this.getIconByDeviceType(d.device_type);
        })
        return res;
      })
    );
  }

  getIconByDeviceType(device_type: string) {
    return `fa ${this.iconSvc.getIconByDeviceType(this.utilSvc.getDeviceMappingByDeviceType(device_type))} fa-xs`;
  }

  submit(data: any) {
    return this.http.patch<any>('/customer/finops/mapping/map_devices/', data);
  }

}

export const deviceTypes: { label: string, value: string }[] = [
  { label: 'Switch', value: 'switch' },
  { label: 'Firewall', value: 'firewall' },
  { label: 'Load Balancer', value: 'load_balancer' },
  { label: 'Hypervisor', value: 'hypervisor' },
  { label: 'Baremetal Server', value: 'baremetal' },
  { label: 'Mac Device', value: 'mac_device' },
  { label: 'Storage', value: 'storage' },
  { label: 'Vmware Virtual Machine', value: 'vmware' },
  { label: 'vCloud Virtual Machine', value: 'vcloud' },
  { label: 'ESXI Virtual Machine', value: 'esxi' },
  { label: 'Hyper-V Virtual Machine', value: 'hyperv' },
  { label: 'OpenStack Virtual Machine', value: 'open_stack' },
  { label: 'Custom Virtual Machine', value: 'virtual_machine' },
];