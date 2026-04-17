import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  GET_REPORT_PREVIEW_COLUMNS,
  MANAGE_REPORT_PREVIEW,
} from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Dc Inventory Preview.
 */
@Injectable()
export class ReportManagementDcInventoryPreviewService {
  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder
  ) {}

  /**
   * Loads or returns report by id for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @returns The requested API observable or computed data.
   */
  getReportById(
    uuid: string,
    criteria: SearchCriteria
  ): Observable<PaginatedResult<DCInventoryPreview>> {
    // Shared preview endpoint supports search, sort, and pagination criteria.
    return this.tableService.getData<PaginatedResult<DCInventoryPreview>>(
      MANAGE_REPORT_PREVIEW(uuid),
      criteria
    );
  }

  /**
   * Loads or returns columns by id for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The requested API observable or computed data.
   */
  getColumnsById(uuid: string): Observable<DCInventoryPreviewColumns> {
    return this.http.get<DCInventoryPreviewColumns>(
      GET_REPORT_PREVIEW_COLUMNS(uuid)
    );
  }

  /**
   * Converts fields into the view or API format expected by the workflow.
   *
   * @param fields - Fields value used by this method.
   * @returns The normalized data structure expected by the caller.
   */
  convertFields(fields: any) {
    // Backend returns a key/value column map; templates consume an ordered array.
    let fieldsArr = [];
    for (const [key, value] of Object.entries(fields)) {
      let field = new ColumnHeaders();
      field.key = key;
      field.value = <string>value;
      fieldsArr.push(field);
    }
    return fieldsArr;
  }

  /**
   * Builds column selection form used by the current workflow.
   *
   * @param columns - Columns value used by this method.
   * @returns The constructed form, payload, or API observable.
   */
  buildColumnSelectionForm(columns: ColumnHeaders[]) {
    return this.builder.group({
      columns: [columns],
    });
  }
}

/**
 * Describes the Dcinventory Preview data contract used by Unity Reports.
 */
export interface DCInventoryPreview {
  /**
   * Describes the snmp version value in the Dcinventory Preview contract.
   */
  snmp_version: string;
  /**
   * Describes the last updated value in the Dcinventory Preview contract.
   */
  last_updated: string;
  /**
   * Describes the asset tag value in the Dcinventory Preview contract.
   */
  asset_tag: string;
  /**
   * Describes the device type value in the Dcinventory Preview contract.
   */
  device_type: string;
  /**
   * Describes the cloud value in the Dcinventory Preview contract.
   */
  cloud: string;
  /**
   * Describes the environment value in the Dcinventory Preview contract.
   */
  environment: string;
  /**
   * Describes the uptime value in the Dcinventory Preview contract.
   */
  uptime: string;
  /**
   * Describes the monitoring value in the Dcinventory Preview contract.
   */
  monitoring: string;
  /**
   * Describes the discovery method value in the Dcinventory Preview contract.
   */
  discovery_method: string;
  /**
   * Describes the end of life value in the Dcinventory Preview contract.
   */
  end_of_life: string;
  /**
   * Describes the end of service value in the Dcinventory Preview contract.
   */
  end_of_service: string;
  /**
   * Describes the note value in the Dcinventory Preview contract.
   */
  note: string;
  /**
   * Describes the memory value in the Dcinventory Preview contract.
   */
  memory: string;
  /**
   * Describes the serial number value in the Dcinventory Preview contract.
   */
  serial_number: string;
  /**
   * Describes the status value in the Dcinventory Preview contract.
   */
  status: string;
  /**
   * Describes the tags value in the Dcinventory Preview contract.
   */
  tags: string;
  /**
   * Describes the snmp authname value in the Dcinventory Preview contract.
   */
  snmp_authname: string;
  /**
   * Describes the cloud name value in the Dcinventory Preview contract.
   */
  cloud_name: string;
  /**
   * Describes the ip address value in the Dcinventory Preview contract.
   */
  ip_address: string;
  /**
   * Describes the datacenter value in the Dcinventory Preview contract.
   */
  datacenter: string;
  /**
   * Describes the last discovered value in the Dcinventory Preview contract.
   */
  last_discovered: string;
  /**
   * Describes the first discovered value in the Dcinventory Preview contract.
   */
  first_discovered: string;
  /**
   * Describes the name value in the Dcinventory Preview contract.
   */
  name: string;
  /**
   * Describes the dns name value in the Dcinventory Preview contract.
   */
  dns_name: string;
  /**
   * Describes the snmp authpass value in the Dcinventory Preview contract.
   */
  snmp_authpass: string;
  /**
   * Describes the snmp authalgo value in the Dcinventory Preview contract.
   */
  snmp_authalgo: string;
  /**
   * Describes the management ip value in the Dcinventory Preview contract.
   */
  management_ip: string;
  /**
   * Describes the model value in the Dcinventory Preview contract.
   */
  model: string;
  /**
   * Describes the snmp authlevel value in the Dcinventory Preview contract.
   */
  snmp_authlevel: string;
  /**
   * Describes the cpu value in the Dcinventory Preview contract.
   */
  cpu: string;
}

/**
 * Describes the Dcinventory Preview Columns data contract used by Unity Reports.
 */
export interface DCInventoryPreviewColumns {
  /**
   * Describes the columns value in the Dcinventory Preview Columns contract.
   */
  columns: any;
  // name: string;
  // key: string;
}

/**
 * Represents the Column Headers contract used by the Unity Reports module.
 */
class ColumnHeaders {
  constructor() {}
  /**
   * Stores the key value used by Column Headers.
   */
  key: string;
  /**
   * Stores the value value used by Column Headers.
   */
  value: string;
}
