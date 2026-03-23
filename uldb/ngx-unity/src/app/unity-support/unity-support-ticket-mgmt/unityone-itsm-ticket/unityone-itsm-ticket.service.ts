import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityOneITSMType } from 'src/app/unity-setup/unity-setup-integration/usi-unityone-itsm/usi-unityone-itsm.service';

@Injectable()
export class UnityoneItsmTicketService {

  constructor(private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private http: HttpClient
  ) { }

  getUnityOneITSMData(tableId: string, criteria: SearchCriteria): Observable<PaginatedResult<Record<string, any>>> {
    return this.tableService.getData<PaginatedResult<Record<string, any>>>(`/rest/unity_itsm/tables/${tableId}/records/`, criteria);
  }

  getUnityOneITSMTableData(tableId: string): Observable<UnityOneITSMType> {
    return this.http.get<UnityOneITSMType>(`/rest/unity_itsm/tables/${tableId}/`);
  }

  convertToViewData(data: Record<string, any>[]): Record<string, any>[] {
    return data?.map(row => {
      const normalized: Record<string, any> = {};

      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value && typeof value === 'object' && 'display_value' in value) { // for reference need to show display_value
          normalized[key] = value.display_value;
        } else if (value !== null && typeof value === 'object') {
          normalized[key] = JSON.stringify(value);
        } else {
          normalized[key] = value;
        }
      });

      return normalized;
    });
  }


  buildColumnSelectionForm(columns: any[]) {
    return this.builder.group({
      'columns': [columns]
    });
  }
}
export interface ITSMColumn {
  key: string;
  label: string;
}

