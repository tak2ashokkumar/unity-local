import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class ApplicationOverviewDashboardService {

  constructor(private http: HttpClient,) { }

  getApplications(): Observable<AppType> {
    return this.http.get<AppType>('/apm/monitoring/parent_app_list/')
  }

  convertToApplicationViewData(applications: ApplicationType[]): ApplicationType[] {
    let viewData: ApplicationType[] = [];
    applications.forEach(app => {
      if (app.name === "astronomy-shop") {
        viewData.push({ ...app, displayName: 'AstronomyShop' });
      } else if (app.name === "bank-of-anthos") {
        viewData.push({ ...app, displayName: 'Bank of Anthos' });
      }
    });

    applications.forEach(app => {
      if (app.name === "astronomy-shop") {
        viewData.push({ ...app, displayName: 'EasyTrade' });
      }
    });

    return viewData;
  }

  getDateDropdownOptions(): DateDropdownOptionsData {
    let view = new DateDropdownOptionsData();
    view.options = _clone(customDateRangeOptions);
    view.defaultSelected = 'last_30_days';
    return view;
  }

}


export class DateDropdownOptionsData {
  options: CustomDateRangeType[] = [];
  defaultSelected: string;
  formData: any;
  frequency?: string;
}

export const customDateRangeOptions: CustomDateRangeType[] = [
  { label: 'Last 24 hours', value: 'last_24_hours', valueAsFrequency: 'daily' },
  { label: 'Last 7 days', value: 'last_7_days', valueAsFrequency: 'weekly' },
  { label: 'Last 30 days', value: 'last_30_days', valueAsFrequency: 'monthly' },
]

export interface AppType {
  count: number,
  next: any,
  previous: any,
  results: ApplicationType[]
}

export interface ApplicationType {
  name: string;
  id: number;
  customer: number;
  throughput: string;
  latency: string;
  status_code: string;

  // Below properties are added for view purpose and not part of actual API response
  displayName?: string;
}