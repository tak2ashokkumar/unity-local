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
 * Provides API access, form construction, and data mapping helpers for Report Management Cost Analysis Preview.
 */
@Injectable({
  providedIn: 'root',
})
export class ReportManagementCostAnalysisPreviewService {
  constructor(
    private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder
  ) {}

  /**
   * Loads or returns data for the current workflow.
   *
   * @param criteria - Search, sort, and pagination criteria for the table request.
   * @param uuid - Identifier used to target the uuid.
   * @returns The requested API observable or computed data.
   */
  getData(
    criteria: SearchCriteria,
    uuid: string
  ): Observable<PaginatedResult<PreviewModel>> {
    // Cost preview uses the generic report preview endpoint with table criteria.
    return this.tableService.getData<PaginatedResult<PreviewModel>>(
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
  getColumnsById(uuid: string): Observable<CostAnalysisPreviewColumns> {
    return this.http.get<CostAnalysisPreviewColumns>(
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
 * Describes the Preview Model data contract used by Unity Reports.
 */
export interface PreviewModel {
  /**
   * Describes the cloud type value in the Preview Model contract.
   */
  cloud_type?: string;
  /**
   * Describes the name value in the Preview Model contract.
   */
  name?: string;
  /**
   * Describes the region value in the Preview Model contract.
   */
  region?: string;
  /**
   * Describes the month value in the Preview Model contract.
   */
  month?: string;
  /**
   * Describes the cost value in the Preview Model contract.
   */
  cost?: string | number;
  /**
   * Describes the resource value in the Preview Model contract.
   */
  resource?: string;
}

/**
 * Describes the Cost Analysis Preview Columns data contract used by Unity Reports.
 */
export interface CostAnalysisPreviewColumns {
  /**
   * Describes the columns value in the Cost Analysis Preview Columns contract.
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
