import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AWS_CO2_DATA } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class UsiImportDataService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getSustanabilityData(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<AwsImportDataType>>(AWS_CO2_DATA(), criteria);
  }

  convertToListData(data: AwsImportDataType[]): AwsCo2ViewData[] {
    let lv: AwsCo2ViewData[] = [];
    data.map(k => {
      let view: AwsCo2ViewData = new AwsCo2ViewData();
      view.id = k.id;
      view.platform = k.platform_type;
      view.accountId = k.account_id;
      view.fileName = k.file_name;
      view.importStatus = k.file_status;
      view.importDate = k.created_at ? this.utilSvc.toUnityOneDateFormat(k.created_at) : 'NA';
      view.description = k.description;
      view.importedBy = k.full_name;
      view.filePath = k.aws_file;
      if (k.file_status == 'Successful') {
        view.fileTooltip = 'import sucessful';
        view.statusIcon = 'fa-check-circle text-success';
      } else {
        view.fileTooltip = 'import failed';
        view.statusIcon = 'fa-exclamation-circle text-danger';
      }
      lv.push(view);
    })
    return lv;
  }

  delete(id: number) {
    return this.http.delete(`/customer/sustainability/awsco2uploadedfile/${id}/`);
  }
}

export class AwsCo2ViewData {
  constructor() { }
  id: number;
  platform: string;
  accountId: string;
  fileName: string;
  importStatus: string;
  importDate: string;
  description: string;
  fileTooltip: string;
  filePath: string;
  statusIcon: string;
  importedBy: string;
}

export interface AwsImportDataType {
  id: number;
  account_name: string;
  account_id: string;
  file_name: string;
  aws_account_name: string;
  aws_file: string;
  file_status: string;
  description: string;
  created_at: string;
  full_name: string;
  platform_type: string;
}


