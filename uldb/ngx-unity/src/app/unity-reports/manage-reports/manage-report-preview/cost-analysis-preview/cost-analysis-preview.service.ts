import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_REPORT_PREVIEW_COLUMNS, MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class CostAnalysisPreviewService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder) { }

  getData(criteria: SearchCriteria, uuid: string): Observable<PaginatedResult<PreviewModel>> {
    return this.tableService.getData<PaginatedResult<PreviewModel>>((MANAGE_REPORT_PREVIEW(uuid)), criteria);
  }
  
  getColumnsById(uuid: string): Observable<CostAnalysisPreviewColumns> {
    return this.http.get<CostAnalysisPreviewColumns>(GET_REPORT_PREVIEW_COLUMNS(uuid));
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

export interface PreviewModel {
  cloud_type?: string,
  name?: string,
  region?: string,
  month?: string,
  cost?: string | number,
  resource?: string
}

export interface CostAnalysisPreviewColumns{
  columns : any;
  // name: string;
  // key: string;
}

class ColumnHeaders {
  constructor() { }
  key: string;
  value: string;
}
