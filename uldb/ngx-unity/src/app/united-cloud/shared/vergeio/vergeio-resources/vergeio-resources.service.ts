import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { VERGEIO_RESOURCE_LIST } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class VergeioResourcesService {

  constructor(private tableService: TableApiServiceService) { }

  // resourceType is the plural path segment: clusters | hosts | datastores | networks.
  getResources(resourceType: string, pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<VergeioResource>> {
    return this.tableService.getData<PaginatedResult<VergeioResource>>(`${VERGEIO_RESOURCE_LIST(resourceType)}?cloud_uuid=${pcId}`, criteria);
  }
}

export interface VergeioResource {
  uuid: string;
  name: string;
  resource_type: string;
  cluster_id: string;
  host_id: string;
  management_ip: string;
  data: any;
}
