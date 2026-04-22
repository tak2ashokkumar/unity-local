import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { PDUCRUDCabinet, PDUCRUDModel } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';

@Injectable()
export class DeviceDetailsBulkUpdatePopupService {

  constructor(private builder: FormBuilder, private http: HttpClient,) { }

  convertBulkUpdateFormData(editedFields: { field: string, edit_value: any }[]): Record<string, any> {
    const result: Record<string, any> = {};
    editedFields.forEach(edit => {
      result[edit.field] = edit.edit_value;
    });
    return result;
  }

  transformSubmittedData(data: any, deviceType: string): any {
    const isSimpleManufacturer = ['switch', 'firewall', 'loadbalancers'].includes(deviceType);
    const ispvtCloud = ['bm-servers', 'mac-mini', 'storage-devices', 'hypervisors'].includes(deviceType);

    return {
      ...data,
      ...(data?.manufacturer != null &&
        (isSimpleManufacturer
          ? { manufacturer: Number(data.manufacturer) }
          : { manufacturer: { id: Number(data.manufacturer) } })),
      ...(data?.datacenter && { datacenter: { uuid: data.datacenter } }),
      ...(data?.os && { os: { id: data.os } }),
      ...(data?.collector && { collector: { uuid: data.collector } }),
      ...(data?.credentials && { credentials: { uuid: data.credentials } }),
      ...(data?.cabinet?.id && { cabinet: { id: String(data.cabinet.id) } }),
      // ...(data?.cloud && { cloud: [data.cloud] }),
      ...(data?.cloud != null &&
        (ispvtCloud
          ? { cloud: { id: String(data.cloud.id) } }
          : { cloud: [data.cloud] })),
      ...(data?.model?.id && { model: { id: data.model.id } }),
      ...(data.hypervisor && { hypervisor: data.hypervisor == "Yes" ? true : false })
    };
  }

  getDependentDropDownOptions(value: string, field: string, deviceType: string): Observable<PDUCRUDCabinet[] | DeviceCRUDPrivateCloudFast[] | PDUCRUDModel[]> {
    if (field == 'cabinet') {
      return this.http.get<PDUCRUDCabinet[]>(CABINET_FAST_BY_DEVICE_ID(value));
    } else if (field == 'cloud') {
      return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(value));
    } else {
      return this.getModelList(value, deviceType);
    }
  }

  getModelList(value: string, deviceType: string): Observable<PDUCRUDModel[]> {
    const urlBuilder = this.modelUrlMap[deviceType] || this.modelUrlMap['default'];
    const url = urlBuilder(value);
    return this.http.get<PDUCRUDModel[]>(url);
  }

  private modelUrlMap: Record<string, (value: string) => string> = {
    'firewall': (value: string) => `/rest/firewallmodel/?manufacturer=${value}&page_size=0`,
    'loadbalancers': (value: string) => `/rest/loadbalancermodel/?manufacturer=${value}&page_size=0`,
    'storage-devices': (value: string) => `/rest/storage_model/?manufacturer=${value}&page_size=0`,
    'switch': (value: string) => `/rest/switchmodel/?manufacturer=${value}&page_size=0`,
    'default': (value: string) => `/rest/server_model/?manufacturer=${value}&page_size=0`
  };

  buildBulkUpdateForm(): FormGroup {
    return this.builder.group({
      fields: this.builder.array([
        this.builder.group({
          field: ['', [Validators.required]],
        })
      ]),
    });
  }

  resetBulkUpdateFormErrors() {
    return {
      'fields': [this.getBulkUpdateFormErrors()]
    };
  }

  getBulkUpdateFormErrors() {
    return {
      'field': '',
      'edit_value': '',
    }
  }

  validationMessages = {
    'fields': {
      'field': {
        'required': 'Field selection is required',
        'dependency': 'This field depends on another field. Please select the required field first.'
      },
      'edit_value': {
        'required': 'Edit Value is required',
        'max': 'Value cannot exceed 20'
      },
    }
  }

}


export const fieldDependencies: { [key: string]: string } = {
  manufacturer: 'model'
};