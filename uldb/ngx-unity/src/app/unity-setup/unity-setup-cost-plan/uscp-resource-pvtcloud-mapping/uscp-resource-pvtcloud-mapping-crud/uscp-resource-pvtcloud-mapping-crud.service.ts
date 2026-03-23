import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PrivateCloudTypeResource } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UscpResourceModelDataType } from '../../uscp-resource-model/uscp-resource-model.type';

@Injectable()
export class UscpResourcePvtcloudMappingCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getPvtCloudAccounts(resourceId: string): Observable<PrivateCloudTypeResource> {
    let params: HttpParams = new HttpParams().set('uuid', resourceId).set('page_size', '0');

    return this.http.get<PrivateCloudTypeResource>('/customer/resources/resource_plan/private_cloud_resource_plan/', { params: params });
  }


  getResourceDetails(uuid: string): Observable<UscpResourceModelDataType> {
    return this.http.get<UscpResourceModelDataType>(`customer/resources/resource_plan/${uuid}/`);
  }

  add(data: PvtCloudMappingDataType) {
    return this.http.post<PvtCloudMappingDataType>(`customer/resources/private_cloud_resources/`, data);
  }

  buildForm(d: UscpResourceModelDataType, resourceModelUuid: string): FormGroup {
    let form = this.builder.group({
      'resource': [{ value: resourceModelUuid, disabled: true }],
      'private_cloud_list': [[], [Validators.required]],
      'is_active': [true]
    })
    return form;
  }

  // convertCloudData(clouds: PrivateCloudType[]): PrivateCloudListItemViewData[] {
  //   let dropdownData: PrivateCloudListItemViewData[] = [];
  //   clouds.map(r => {
  //     let a: PrivateCloudListItemViewData = new PrivateCloudListItemViewData();
  //     a.private_cloud = r.uuid
  //     a.name = r.name
  //     dropdownData.push(a);
  //   })
  //   return dropdownData;
  // }


  resetformErrors() {
    return {
      'private_cloud_list': '',
    }
  }

  validationMessages = {
    'private_cloud_list': {
      'required': 'Cloud selection is required'
    },
  }

}

export interface PvtCloudMappingDataType {
  resource: string;
  is_active: boolean;
  private_cloud_list: PrivateCloudListItem[];
}
interface PrivateCloudListItem {
  private_cloud: string;
}
export class PrivateCloudListItemViewData {
  constructor() { }
  private_cloud: string;
  name: string;
}

