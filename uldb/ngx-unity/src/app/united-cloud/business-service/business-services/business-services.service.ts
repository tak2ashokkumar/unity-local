import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BusinessServiceListItem } from './business-services.type';

@Injectable()
export class BusinessServicesService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }
  getBusinessServiceList(criteria: SearchCriteria): Observable<PaginatedResult<BusinessServiceListItem>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<BusinessServiceListItem>>(`/apm/business_list/`, { params: params });
  }

  toggleStatus(data: any, policyId: number) {
    return this.http.put(`/apm/business_list/${policyId}/`, data);
  }

  delete(id: number) {
    return this.http.delete(`/apm/business_list/${id}/`);
  }

  convertToViewData(data: BusinessServiceListItem[]): BusinessViewData[] {
    return data.map(item => {
      const licenseCenters = [...new Set(item.license_cost_centers.map((l: any) => l.license_centre))];
      const applications = [...new Set(item.license_cost_centers.map((l: any) => l.app_name))];
      const applicationTypes = [...new Set(item.license_cost_centers.map((l: any) => this.utilSvc.toTitleCase(l.type_of_app)))];
      const businessCriticalities = [...new Set(item.license_cost_centers.map((l: any) => this.utilSvc.toTitleCase(l.business_criticality)))];



      const { first: firstApplication, rest: restApplications } = this.splitFirstRest(applications);
      const { first: firstLicenseCenter, rest: restLicenseCenters } = this.splitFirstRest(licenseCenters);
      const { first: firstApplicationType, rest: restApplicationTypes } = this.splitFirstRest(applicationTypes);
      const { first: firstBusinessCriticality, rest: restBusinessCriticalities } = this.splitFirstRest(businessCriticalities);

      return {
        id: item.id,
        status: item.status,
        business: item.business,
        description: item.description || "",
        licenseCenter: licenseCenters,
        firstLicenseCenter,
        restLicenseCenters,
        application: applications,
        firstApplication,
        restApplications,
        applicationType: applicationTypes,
        firstApplicationType,
        restApplicationTypes,
        businessCriticality: businessCriticalities,
        firstBusinessCriticality,
        restBusinessCriticalities
      };
    });
  }

  // Helper to get first & rest
  splitFirstRest = (arr: string[]) => ({
    first: arr.length > 0 ? arr[0] : null,
    rest: arr.length > 1 ? arr.slice(1) : []
  });

}

export class BusinessViewData {
  constructor() { }
  id: number;
  business: string;
  status: string;
  description: string;
  licenseCenter: string[];
  firstLicenseCenter: string | null;
  restLicenseCenters: string[];
  application: string[];
  firstApplication: string | null;
  restApplications: string[];
  applicationType: string[];
  firstApplicationType: string | null;
  restApplicationTypes: string[];
  businessCriticality: string[];
  firstBusinessCriticality: string | null;
  restBusinessCriticalities: string[];
}