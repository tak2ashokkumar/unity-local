import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DELETE_LDAP_CONFIG, GET_LDAP_CONFIG, SYNC_LDAP_CONFIG_BY_ID } from 'src/app/shared/api-endpoint.const';
import { LDAPConfigType } from './unity-setup-ldap-config.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Injectable()
export class UnitySetupLdapConfigService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getLDAPConfigs(): Observable<LDAPConfigType[]> {
    return this.http.get<LDAPConfigType[]>(GET_LDAP_CONFIG());
  }

  syncNow(ldapConfigId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_LDAP_CONFIG_BY_ID(ldapConfigId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  convert(ldapConfig: LDAPConfigType): LDAPConfigViewData {
    let viewData = new LDAPConfigViewData();
    viewData.ldapConfigId = ldapConfig.uuid;
    viewData.ldapUrl = ldapConfig.ldap_url;
    viewData.username = ldapConfig.username;
    viewData.dc = ldapConfig.dc;
    return viewData;
  }

  convertToViewData(data: LDAPConfigType[]): LDAPConfigViewData[] {
    let viewData: LDAPConfigViewData[] = [];
    data.map(d => {
      viewData.push(this.convert(d));
    });
    return viewData;
  }

  deleteConfig(ldapConfigId: string) {
    return this.http.delete(DELETE_LDAP_CONFIG(ldapConfigId));
  }

}

export class LDAPConfigViewData {
  ldapConfigId: string;
  ldapUrl: string;
  username: string;
  dc: string;
  ldapPort: string;
  syncInProgress: boolean = false;
  constructor() { }
}