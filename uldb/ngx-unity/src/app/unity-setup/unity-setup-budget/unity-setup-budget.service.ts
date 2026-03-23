import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { budgetType } from './unity-setup-budget.type';

@Injectable()
export class UnitySetupBudgetService {
  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getBudget(criteria: SearchCriteria): Observable<PaginatedResult<budgetType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<budgetType>>(`/customer/budget/`, { params: params });
  }

  toggleStatus(uuid: string) {
    return this.http.get(`/customer/budget/${uuid}/toggle_status/`);
  }

  deleteBudget(uuid: string) {
    return this.http.delete(`/customer/budget/${uuid}`);
  }

  syncBudget() {
    return this.http.get(`/customer/budget/sync_cloud_data/`);
  }


  convertToViewData(data: budgetType[]): budgetViewData[] {
    let viewData: budgetViewData[] = [];
    data.forEach(a => {
      let td: budgetViewData = new budgetViewData();
      td.uuid = a.uuid;
      td.name = a.name;
      td.scope = a.scope;
      td.period = a.period;
      td.periodSelectionStart = a.period_selection_start ? this.utilSvc.toUnityOneDateFormat(a.period_selection_start, 'DD MMM YYYY') : 'N/A';
      td.periodSelectionEnd = a.period_selection_end ? this.utilSvc.toUnityOneDateFormat(a.period_selection_end, 'DD MMM YYYY') : 'N/A';
      td.createdBy = {
        firstName: a.created_by?.first_name,
        lastName: a.created_by?.last_name,
        fullName: `${a.created_by?.first_name} ${a.created_by.last_name}`,
        createdOn: a.created_at ? this.utilSvc.toUnityOneDateFormat(a.created_at, 'DD/MM/YYYY H:mm') : 'N/A'
      };
      td.updatedBy = {
        firstName: a.updated_by?.first_name,
        lastName: a.updated_by?.last_name,
        fullName: `${a.updated_by?.first_name} ${a.updated_by.last_name}`,
        updatedOn: a.updated_at ? this.utilSvc.toUnityOneDateFormat(a.updated_at, 'DD/MM/YYYY H:mm') : 'N/A'
      };
      td.totalBudget = a.total_budget;
      td.status = a.status;
      // td.budgetAmount.jab = a.budget_amount.jab;
      viewData.push(td);
    });
    return viewData;
  }

}

export class budgetViewData {
  name: string;
  description: string;
  budgetAmount: budgetAmount;
  scope: string;
  period: string;
  periodSelectionStart: string;
  periodSelectionEnd: string;
  updatedAt: string;
  invoice: string;
  status: boolean;
  createdBy: CreatedBy;
  updatedBy: UpdatedBy;
  customer: number;
  cloudId: number;
  cloudAccount: cloudAccount;
  uuid: string;
  cloudType: string;
  totalBudget: string;
}

export class budgetAmount {
  jab: string;
}

export class cloudAccount {
  name: string;
  uuid: string;
}

export class CreatedBy {
  firstName: string;
  lastName: string;
  fullName: string;
  createdOn: string;
}

export class UpdatedBy {
  firstName: string;
  lastName: string;
  fullName: string;
  updatedOn: string;
}
