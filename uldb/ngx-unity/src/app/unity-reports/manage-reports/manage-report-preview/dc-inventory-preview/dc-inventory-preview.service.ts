import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { GET_REPORT_PREVIEW_COLUMNS, MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class DcInventoryPreviewService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getReportById(uuid: string, criteria: SearchCriteria): Observable<PaginatedResult<DCInventoryPreview>> {
    return this.tableService.getData<PaginatedResult<DCInventoryPreview>>(MANAGE_REPORT_PREVIEW(uuid), criteria);
  }

  getColumnsById(uuid: string): Observable<DCInventoryPreviewColumns> {
    return this.http.get<DCInventoryPreviewColumns>(GET_REPORT_PREVIEW_COLUMNS(uuid));
  }
  
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

export interface DCInventoryPreview {
  snmp_version: string;
  last_updated: string;
  asset_tag: string;
  device_type: string;
  cloud: string;
  environment: string;
  uptime: string;
  monitoring: string;
  discovery_method: string;
  end_of_life: string;
  end_of_service: string;
  note: string;
  memory: string;
  serial_number: string;
  status: string;
  tags: string;
  snmp_authname: string;
  cloud_name: string;
  ip_address: string;
  datacenter: string;
  last_discovered: string;
  first_discovered: string;
  name: string;
  dns_name: string;
  snmp_authpass: string;
  snmp_authalgo: string;
  management_ip: string;
  model: string;
  snmp_authlevel: string;
  cpu: string;
}

export interface DCInventoryPreviewColumns{
  columns : any;
  // name: string;
  // key: string;
}

class ColumnHeaders {
  constructor() { }
  key: string;
  value: string;
}
