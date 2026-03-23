import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { Category } from './knowledge-management-crud/knowledge-management-crud.type';
import { Resource } from './knowledge-management.type';
import { BaseUrlService } from './base-url.service';

@Injectable()
export class KnowledgeManagementService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private builder: FormBuilder,
    private userService: UserInfoService,
    private tableService: TableApiServiceService, private urlService: BaseUrlService) { }

  getResources(criteria: SearchCriteria): Observable<PaginatedResult<Resource>> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.tableService.getData<PaginatedResult<Resource>>(`${this.urlService.getBaseUrl()}documents`, criteria, headers,);
  }

  convertToResourceViewData(data: Resource[]): ResourceViewData[] {
    let viewData: ResourceViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    data.forEach(r => {
      let view: ResourceViewData = new ResourceViewData();
      view.name = r.name;
      view.id = r.id;
      view.category = r.category;
      view.description = r.description;
      view.type = r.type;
      view.createdAt = r.created_at ? datePipe.transform(r.created_at.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      viewData.push(view);
    });
    return viewData
  }

  getCategories(): Observable<Category[]> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.get<Category[]>(`${this.urlService.getBaseUrl()}category/`, { headers });
  }

  convertToTrendByResourceData(): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.series[0].data = [{ 'name': 'Cat1', 'value': 9 }, { 'name': 'Cat2', 'value': 10 }];
    view.options.tooltip = {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name} (${params.value})`;
      }
    };
    view.options.series[0].label = {
      formatter: '{c}',
      show: true
    };
    return view;
  }

  buildCategoryForm(category: string): FormGroup {
    return this.builder.group({
      'name': [category ? category : '', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetCategoryFormErrors() {
    return {
      'name': '',
    }
  }

  categoryValidationMessages = {
    'name': {
      'required': 'Name is required.'
    },
  }

  createCategory(name: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.post(`${this.urlService.getBaseUrl()}category/?name=${name}`, null, { headers });
  }

  updateCategory(name: string, categoryId: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.put(`${this.urlService.getBaseUrl()}category/${categoryId}?name=${name}`, null, { headers });
  }

  deleteCategory(categoryId: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.delete(`${this.urlService.getBaseUrl()}category/${categoryId}`, { headers });
  }

  deleteResource(resourceId: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.delete(`${this.urlService.getBaseUrl()}documents/${resourceId}`, { headers });
  }

}

export class ResourceViewData {
  constructor() { }
  name: string;
  id: string;
  description: string;
  createdAt: string;
  category: string;
  type: string;
}