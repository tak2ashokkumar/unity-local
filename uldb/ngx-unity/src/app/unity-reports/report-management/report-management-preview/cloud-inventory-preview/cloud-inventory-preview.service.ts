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
 * Provides API access, form construction, and data mapping helpers for Report Management Cloud Inventory Preview.
 */
@Injectable()
export class ReportManagementCloudInventoryPreviewService {
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
  ): Observable<PaginatedResult<CloudInventoryPreview>> {
    // Shared preview endpoint supports search, sort, and pagination criteria.
    return this.tableService.getData<PaginatedResult<CloudInventoryPreview>>(
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
  getColumnsById(uuid: string): Observable<CloudInventoryPreviewColumns> {
    return this.http.get<CloudInventoryPreviewColumns>(
      GET_REPORT_PREVIEW_COLUMNS(uuid)
    );
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
 * Describes the Cloud Inventory Preview data contract used by Unity Reports.
 */
export interface CloudInventoryPreview {
  /**
   * Describes the status value in the Cloud Inventory Preview contract.
   */
  status: string;
  /**
   * Describes the os name value in the Cloud Inventory Preview contract.
   */
  os_name: null;
  /**
   * Describes the name value in the Cloud Inventory Preview contract.
   */
  name: string;
  /**
   * Describes the resource group value in the Cloud Inventory Preview contract.
   */
  resource_group: string;
  /**
   * Describes the availability zone value in the Cloud Inventory Preview contract.
   */
  availability_zone: string;
  /**
   * Describes the region value in the Cloud Inventory Preview contract.
   */
  region: string;
  /**
   * Describes the public ip value in the Cloud Inventory Preview contract.
   */
  public_ip: string;
  /**
   * Describes the instance type value in the Cloud Inventory Preview contract.
   */
  instance_type: string;
  /**
   * Describes the management ip value in the Cloud Inventory Preview contract.
   */
  management_ip: null;
  /**
   * Describes the ip type value in the Cloud Inventory Preview contract.
   */
  ip_type: null;
  /**
   * Describes the os type value in the Cloud Inventory Preview contract.
   */
  os_type: null;
  /**
   * Describes the account name value in the Cloud Inventory Preview contract.
   */
  account_name: string;
  /**
   * Describes the end time value in the Cloud Inventory Preview contract.
   */
  end_time: string;
  /**
   * Describes the start time value in the Cloud Inventory Preview contract.
   */
  start_time: string;
  /**
   * Describes the created at value in the Cloud Inventory Preview contract.
   */
  created_at: string;
}

/**
 * Represents normalized view data consumed by Unity Reports templates.
 */
export class CloudInventoryPreviewViewData {
  /**
   * Stores the status value used by Cloud Inventory Preview View Data.
   */
  status?: string;
  /**
   * Stores the os name value used by Cloud Inventory Preview View Data.
   */
  osName?: null;
  /**
   * Stores the name value used by Cloud Inventory Preview View Data.
   */
  name?: string;
  /**
   * Stores the resource group value used by Cloud Inventory Preview View Data.
   */
  resourceGroup?: string;
  /**
   * Stores the availability zone value used by Cloud Inventory Preview View Data.
   */
  availabilityZone?: string;
  /**
   * Stores the region value used by Cloud Inventory Preview View Data.
   */
  region?: string;
  /**
   * Stores the public ip value used by Cloud Inventory Preview View Data.
   */
  publicIp?: string;
  /**
   * Stores the instance type value used by Cloud Inventory Preview View Data.
   */
  instanceType?: string;
  /**
   * Stores the management ip value used by Cloud Inventory Preview View Data.
   */
  managementIp?: null;
  /**
   * Stores the ip type value used by Cloud Inventory Preview View Data.
   */
  ipType?: null;
  /**
   * Stores the os type value used by Cloud Inventory Preview View Data.
   */
  osType?: null;
  /**
   * Stores the account name value used by Cloud Inventory Preview View Data.
   */
  accountName?: string;
  constructor() {}
}

/**
 * Describes the Cloud Inventory Preview Columns data contract used by Unity Reports.
 */
export interface CloudInventoryPreviewColumns {
  /**
   * Describes the columns value in the Cloud Inventory Preview Columns contract.
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
