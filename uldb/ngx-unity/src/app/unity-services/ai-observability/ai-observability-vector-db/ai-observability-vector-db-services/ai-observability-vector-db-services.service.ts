import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityVectorDbServicesService {

  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getVectorDbData(criteria: SearchCriteria): Observable<PaginatedResult<VectorDbModelDataType>> {
    return this.tableService.getData<PaginatedResult<VectorDbModelDataType>>('/customer/observability/vectordbs/', criteria);
  }

  convertToViewData(data: VectorDbModelDataType[]): VectorDbModel[] {
    let viewData: VectorDbModel[] = [];
    if (data) {
      data.map(d => {
        let view: VectorDbModel = new VectorDbModel();
        view.uuid = d.uuid;
        view.name = d.name;
        view.type = d.vector_db_types?.length ? d.vector_db_types[0] : '';
        view.extraTypes = d.vector_db_types?.length > 1 ? d.vector_db_types.slice(1) : [];
        view.extraTypesLength = view.extraTypes.length;
        // view.dbCollectionName = d.db_collection_name;
        view.dbCollectionName = d.db_collection_names?.length ? d.db_collection_names[0] : '';
        view.extraDbCollectionNames = d.db_collection_names?.length > 1 ? d.db_collection_names.slice(1) : [];
        view.extraDbCollectionLength = view.extraDbCollectionNames.length;
        // view.dbOperationName = d.db_operation_name;                
        view.dbOperationName = d.db_operation_names?.length ? d.db_operation_names[0] : '';
        view.extraDbOperationNames = d.db_operation_names?.length > 1 ? d.db_operation_names.slice(1) : [];
        view.extraDbOperationLength = view.extraDbOperationNames.length;
        // view.dbSystemName = d.db_system_name;
        view.DbVectorCount = d.total_db_vector_count;
        viewData.push(view);
      })
    }
    return viewData;
  }

}

export interface VectorDbModelDataType {
  uuid: string;
  name: string;
  service_type: string;
  db_collection_names: string[];
  db_operation_names: string[];
  vector_db_types: string[];
  server_addresses: string[];
  server_ports: string[];
  total_db_vector_count: number;
  created_at: string;
  updated_at: string;
}

export class VectorDbModel {
  uuid: string;
  name: string;
  type: string;  
  extraTypes: string[];
  extraTypesLength: number;
  dbCollectionName: string;
  extraDbCollectionNames: string[];
  extraDbCollectionLength: number;
  dbOperationName: string;
  extraDbOperationNames: string[];
  extraDbOperationLength: number;
  DbVectorCount: number;
  constructor() { }
}
