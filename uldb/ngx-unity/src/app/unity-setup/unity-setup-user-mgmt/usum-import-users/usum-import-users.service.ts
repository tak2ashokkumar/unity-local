import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { GET_AZURE_ACCOUNTS, GET_AZURE_USERS, IMPORT_USERS_FROM_AZURE } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UsumImportUsersService {

  constructor(private http: HttpClient) { }

  getAzureAccounts(): Observable<AzureManageAccountsType[]> {
    const params: HttpParams = new HttpParams().set('page_size', '0');
    return this.http.get<AzureManageAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  getAzureUsers(accountId: string, criteria: AzureUsersQueryParams): Observable<AzureUsersResponse> {
    let params: HttpParams = new HttpParams()
      .set('page_size', criteria.pageSize.toString())
      .set('page', criteria.page.toString());
    const nextLink: string = criteria.nextLink ? criteria.nextLink.trim() : '';
    const search: string = criteria.search ? criteria.search.trim() : '';
    if (nextLink) {
      params = params.set('next_link', nextLink);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<AzureUsersResponse>(GET_AZURE_USERS(accountId), { params: params });
  }

  convertToViewData(data: AzureUserType[]): ImportUserViewData[] {
    return data.map(d => {
      const email: string = d.mail ? d.mail.trim() : '';
      const view: ImportUserViewData = new ImportUserViewData();
      view.firstName = d.givenName || '';
      view.lastName = d.surname || '';
      view.email = email;
      view.canSelect = !!email;
      view.isSelected = false;
      return view;
    });
  }

  importUsersFromAzureAD(accountId: string, payload: ImportUsersFromAzurePayload): Observable<string> {
    return this.http.post<string>(IMPORT_USERS_FROM_AZURE(accountId), payload);
  }

}

export interface ImportUsersFromAzurePayload {
  selected_users?: string[];
  excluded_users?: string[];
  is_all_selected: boolean;
  search?: string;
}

export interface AzureUsersQueryParams {
  nextLink?: string;
  pageSize: number;
  search?: string;
  page: number;
}

export type AzureUsersResponse = AzureUsersPaginatedResponse | AzureUserType[];

export interface AzureUsersPaginatedResponse {
  count?: number;
  results: AzureUserType[];
  next?: string | null;
  page?: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export class ImportUserViewData {
  constructor() { }
  firstName: string;
  lastName: string;
  email: string;
  canSelect: boolean = false;
  isSelected: boolean = false;
}

export interface AzureUserType {
  displayName?: string | null;
  mobilePhone?: string | null;
  preferredLanguage?: string | null;
  jobTitle?: string | null;
  userPrincipalName?: string | null;
  officeLocation?: string | null;
  businessPhones?: string[];
  mail?: string | null;
  surname?: string | null;
  givenName?: string | null;
  id?: string | null;
}
