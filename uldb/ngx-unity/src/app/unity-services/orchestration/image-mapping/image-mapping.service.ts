import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { IMAGE_MAPPING } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class ImageMappingService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getImageMappingData(criteria: SearchCriteria): Observable<PaginatedResult<ImageMappingModel>> {
    return this.tableService.getData<PaginatedResult<ImageMappingModel>>(IMAGE_MAPPING(), criteria);
  }

  deleteRecord(uuid: string) {
    return this.http.delete(IMAGE_MAPPING(uuid));
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  convertToViewData(data: ImageMappingModel[]): ImageMappingViewModel[] {
    let viewData: ImageMappingViewModel[] = [];
    data.map(val => {
      let im: ImageMappingViewModel = new ImageMappingViewModel();
      im.uuid = val.uuid;
      im.name = val.name;
      im.description = val.description;
      im.osType = val.os_type;
      im.osName = val.os_name;
      im.osVersion = val.os_version;
      im.osEdition = val.os_edition;
      im.minMemory = val.min_memory;
      im.minVcpu = val.min_vcpu;
      im.username = val.username;
      im.password = val.password;
      im.location = val.location_name;
      im.cloud = val.cloud;
      im.storage_type = val.storage_type;
      im.filePath = val.file_path;
      im.editedBy = val.edited_by;
      im.createdBy = val.created_by_name;
      im.createdAt = val.created_at ? this.utilSvc.toUnityOneDateFormat(val.created_at) : 'N/A';
      im.updatedAt = val.updated_at ? this.utilSvc.toUnityOneDateFormat(val.updated_at) : 'N/A';
      viewData.push(im);
    });
    return viewData;
  }

}

export const nodesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Min Memory',
    'key': 'minMemory',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Min vCPU',
    'key': 'minVcpu',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Username',
    'key': 'username',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Created On',
    'key': 'createdAt',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Created By',
    'key': 'createdBy',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Modified On',
    'key': 'updatedAt',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Modified By',
    'key': 'editedBy',
    'default': false,
    'mandatory': false
  }
]
export class ImageMappingModel {
  uuid: string;
  name: string;
  description: string;
  os_type: string;
  os_name: string;
  os_version: string;
  os_edition: string;
  min_memory: number;
  min_vcpu: number;
  username: string;
  password: string;
  location: string;
  location_name: string;
  cloud: string;
  storage_type: string;
  file_path: string;
  edited_by: string;
  created_by: number;
  created_by_name: string;
  created_at?: string;
  updated_at?: string;
}

export class ImageMappingViewModel {
  uuid: string;
  name: string;
  description: string;
  osType: string;
  osName: string;
  osVersion: string;
  osEdition: string;
  minMemory: number;
  minVcpu: number;
  username: string;
  password: string;
  location: string;
  cloud: string;
  storage_type: string;
  filePath: string;
  editedBy: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}