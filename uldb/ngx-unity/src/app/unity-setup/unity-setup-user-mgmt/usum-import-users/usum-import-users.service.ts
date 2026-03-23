import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { GET_AZURE_ACCOUNTS, GET_AZURE_USERS, IMPORT_USERS_FROM_AZURE } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UsumImportUsersService {

  constructor(private http: HttpClient) { }

  getAzureAccounts(): Observable<AzureManageAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AzureManageAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  getAzureUsers(accountId: string): Observable<AzureUserType[]> {
    return this.http.get<AzureUserType[]>(GET_AZURE_USERS(accountId));
  }

  convertToViewData(data: AzureUserType[]): ImportUserViewData[] {
    data = data.filter(d => d.mail);
    let viewData: ImportUserViewData[] = [];
    data.map(d => {
      let a: ImportUserViewData = new ImportUserViewData();
      a.firstName = d.givenName;
      a.lastName = d.surname;
      a.email = d.mail;
      a.isSelected = false;
      viewData.push(a);
    });
    return viewData;
  }

  importUsersFromAzureAD(accountId: string, selectedUsers: AzureUserType[]) {
    return this.http.post(IMPORT_USERS_FROM_AZURE(accountId), { users: selectedUsers });
  }

}

export class ImportUserViewData {
  constructor() { }
  firstName: string;
  lastName: string;
  email: string;
  isSelected: boolean = false;
}

export interface AzureUserType {
  displayName: string;
  mobilePhone: string;
  preferredLanguage: string;
  jobTitle: string;
  userPrincipalName: string;
  officeLocation: string;
  businessPhones: string[];
  mail: string;
  surname: string;
  givenName: string;
  id: string;
}