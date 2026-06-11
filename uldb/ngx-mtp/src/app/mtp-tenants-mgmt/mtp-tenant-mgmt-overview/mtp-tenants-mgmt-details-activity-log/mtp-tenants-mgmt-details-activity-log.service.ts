import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ACTIVITY_LOG } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpTenantsMgmtDetailsActivityLogService {

  constructor( private http:HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,) { }

  getActivityLog(uuid: string, criteria: SearchCriteria){
    return this.tableService.getData<PaginatedResult<MtpTenantActivityLogDataType>>(GET_ACTIVITY_LOG(uuid), criteria);
  }

  convertActivityLogToViewData(data:MtpTenantActivityLogDataType[]):MtpTenantMgmtActivityLogViewData[]  {
    let viewData: MtpTenantMgmtActivityLogViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    data.map(logs=>{
      let a: MtpTenantMgmtActivityLogViewData = new MtpTenantMgmtActivityLogViewData();
      a.entityType = logs.content_type.readable_model_name;
      a.entityName= logs.object_repr;
      a.appLabel = logs.content_type.app_label;
      a.modelName = logs.content_type.model;
      if (logs.actor === null) {
        if (logs.content_type.app_label == 'user2') {
          a.user = logs.object_repr;
        } else {
          a.user = 'System';
        }
      } else {
        a.user = logs.actor.email;
      }
      a.action= logs.action;
      a.sourceIp = logs.remote_addr ? logs.remote_addr : 'N/A';
      a.hijaker = logs.hijaker ? logs.hijaker.email : null;
      a.additionalData = logs.additional_data ? logs.additional_data.action : null;
      a.timestamp = datePipe.transform(logs.timestamp.replace(/\s/g, "T"), environment.unityDateFormat);
      let changes = JSON.parse(logs.changes);
      a.changesLogKeys = Object.keys(changes)
      for (let value of Object.values(changes)) {
        if (a.action == 'Created') {
          value[0] = value[1];
        }
      }
      a.changesLog = changes;
      viewData.push(a);
    })
    return viewData;
  }

}

export class MtpTenantMgmtActivityLogViewData {
  constructor()  {}
  entityType: string;
  entityName: string;
  actor: Actor;
  modelName: string;
  appLabel: string;
  changes: string;
  changesLog: string;
  changesLogKeys: Array<string>;
  // actor_email: string;
  user: string;
  action: string;
  sourceIp: string;
  timestamp: string;
  hijaker: string;
  additionalData:Array<string>;
}

export class Actor {
  constructor() {}
  email: string;
}

export class MtpTenantMgmtActivityLogEntityName{
  constructor() {}
  appLabel: string;
  readableModelName: string;
  model: string;
}

export interface MtpTenantActivityLogDataType {
  id: string;
  actor: MtpTenantActivityLogActorDataType;
  hijacker: string;
  action: string;
  content_type: MtpTenantActivityLogContentDataType;
  object_pk: string;
  email: string;
  object_id: string;
  object_repr: string;
  changes: string;
  remote_addr: string;
  timestamp: string;
  additional_data: LogAdditionalDataType;
  organizations: number[];
  hijaker: HijakerDataType;
}

export interface LogAdditionalDataType{
  action: string[];
}

export interface HijakerDataType{
  email:string;
}

export interface MtpTenantActivityLogActorDataType{
  email: string;
}

export interface MtpTenantActivityLogContentDataType{
  app_label: string;
  model: string;
  readable_model_name: string;
  id: number;
}

export const DOWNLOAD_URL = (tenantUuid: string,end_date: string, start_date: string) => `/customer/mtp/download/${tenantUuid}/download_user_activity_log/?end_date=${end_date}&start_date=${start_date}`;
