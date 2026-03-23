import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OCI_USERS_BY_ACCOUNT_ID } from 'src/app/shared/api-endpoint.const';
import { OCIUserType } from './oci-user.type';

@Injectable()
export class PublicCloudOciUsersService {

  constructor(private http: HttpClient) { }

  getUsers(accountId: string) {
    return this.http.get<OCIUserType[]>(OCI_USERS_BY_ACCOUNT_ID(accountId));
  }

  convertToViewData(users: OCIUserType[]) {
    let viewData: OCIUserViewData[] = [];
    users.map(user => {
      let data = new OCIUserViewData();
      data.name = user.name;
      data.email = user.email ? user.email : 'N/A';
      data.emailVerified = user.email_verified;
      data.description = user.description;
      data.lifecycleState = user.lifecycle_state;
      viewData.push(data);
    });
    return viewData;
  }
}
export class OCIUserViewData {
  constructor() { }
  lifecycleState: string;
  description: string;
  emailVerified: boolean;
  timeCreated: string;
  email: string;
  name: string;
}