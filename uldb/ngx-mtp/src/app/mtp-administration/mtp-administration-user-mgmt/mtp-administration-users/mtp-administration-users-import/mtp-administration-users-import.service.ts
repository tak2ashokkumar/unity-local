import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureAccountsType } from 'src/app/mtp-administration/mtp-administration-integrations/azure-details/azure-details.type';
import { BULK_USER_IMPORT, GET_AZURE_ACCOUNTS, GET_USER_IMPORT_LIST } from 'src/app/shared/api-endpoint.const';
import { ImportUserType } from './mtp-administration-users-import.types';

@Injectable()
export class MtpAdministrationUsersImportService {

  constructor(private http: HttpClient) { }

  getAccounts(): Observable<AzureAccountsType[]> {
    return this.http.get<AzureAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: new HttpParams().set('page_size', 0) });
  }

  getUsers(accountId: string): Observable<ImportUserType[]> {
    return this.http.get<ImportUserType[]>(GET_USER_IMPORT_LIST(accountId));
  }

  convertToViewData(data: ImportUserType[]): ImportUserViewData[] {
    data = data.filter(d => d.mail);
    let viewData: ImportUserViewData[] = [];
    data.map(d => {
      let a: ImportUserViewData = new ImportUserViewData();
      a.firstName = d.givenName;
      a.lastName = d.surname;
      a.email = d.mail;
      viewData.push(a);
    });
    return viewData;
  }

  importUsers(selectedUsers: ImportUserType[]) {
    return this.http.post(BULK_USER_IMPORT(), { users: selectedUsers });
  }
}

export class ImportUserViewData {
  constructor() { }
  firstName: string;
  lastName: string;
  email: string;
  isSelected: boolean = false;
}
