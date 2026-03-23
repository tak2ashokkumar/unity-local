import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_REPORT_PREVIEW_COLUMNS, MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class CloudInventoryPreviewService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getReportById(uuid: string, criteria: SearchCriteria): Observable<PaginatedResult<CloudInventoryPreview>> {
    return this.tableService.getData<PaginatedResult<CloudInventoryPreview>>(MANAGE_REPORT_PREVIEW(uuid), criteria);
  }

  getColumnsById(uuid: string): Observable<CloudInventoryPreviewColumns> {
    return this.http.get<CloudInventoryPreviewColumns>(GET_REPORT_PREVIEW_COLUMNS(uuid));
  }

  // convertToViewData(data: CloudInventoryPreview[]): CloudInventoryPreviewViewData[] {
  //   let viewData: CloudInventoryPreviewViewData[] = [];

  //   data.map(s => {
  //     let a = new CloudInventoryPreviewViewData();
  //     a.status = s.status;
  //     a.osName = s.os_name;
  //     a.name = s.name;
  //     a.resourceGroup = s.resource_group;
  //     a.availabilityZone = s.availability_zone;
  //     a.region = s.region;
  //     a.publicIp = s.public_ip;
  //     a.instanceType = s.instance_type;
  //     a.managementIp = s.management_ip;
  //     a.ipType = s.ip_type;
  //     a.osType = s.os_type;
  //     a.accountName = s.account_name;
  //     viewData.push(a);
  //   });
  //   return viewData;
  // }

  convertFields(fields: any) {
    let fieldsArr = [];
    for (const [key, value] of Object.entries(fields)) {
      let field = new ColumnHeaders();
      field.key = key;
      field.value = <string>value;
      fieldsArr.push(field);
    }
    return fieldsArr;
  }

  buildColumnSelectionForm(columns: ColumnHeaders[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}

export interface CloudInventoryPreview {
  status: string;
  os_name: null;
  name: string;
  resource_group: string;
  availability_zone: string;
  region: string;
  public_ip: string;
  instance_type: string;
  management_ip: null;
  ip_type: null;
  os_type: null;
  account_name: string;
  end_time: string;
  start_time: string;
  created_at: string;
}

export class CloudInventoryPreviewViewData {
  status?: string;
  osName?: null;
  name?: string;
  resourceGroup?: string;
  availabilityZone?: string;
  region?: string;
  publicIp?: string;
  instanceType?: string;
  managementIp?: null;
  ipType?: null;
  osType?: null;
  accountName?: string;
  constructor() { }
}

export interface CloudInventoryPreviewColumns {
  columns: any;
  // name: string;
  // key: string;
}

class ColumnHeaders {
  constructor() { }
  key: string;
  value: string;
}
