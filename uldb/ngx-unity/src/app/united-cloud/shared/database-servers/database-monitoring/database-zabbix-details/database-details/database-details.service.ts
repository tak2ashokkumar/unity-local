import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICE_BY_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatabaseType } from 'src/app/united-cloud/shared/entities/database-servers.type';


@Injectable()
export class DatabaseDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDeviceDetails(deviceId: string): Observable<DatabaseType> {
    return this.http.get<DatabaseType>(DEVICE_BY_ID(DeviceMapping.DB_ENTITY, deviceId));
  }

  getServerData(entityId: string): Observable<DatabaseEntityServerType> {
    return this.http.get<DatabaseEntityServerType>(`/customer/database_entity/${entityId}/database/server-data/`);
  }

  buildDetailForm(d: DatabaseType): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required, NoWhitespaceValidator]],
      'shortDescription': [d.short_description ? d.short_description : '', [Validators.required, NoWhitespaceValidator]],
      'description': [d.description, [Validators.required, NoWhitespaceValidator]],
      'model': [d.model ? d.model : '', [Validators.required, NoWhitespaceValidator]],
      'discoveryMethod': [d.discovery_method ? d.discovery_method : null, [Validators.required, NoWhitespaceValidator]],
      'version': [d.version ? d.version : null, [Validators.required, NoWhitespaceValidator]],
      'databaseServer': [d.database_server ? d.database_server : null, [Validators.required, NoWhitespaceValidator]]
    })
  }


  resetDetailFormErrors() {
    return {
      'name': '',
      'shortDescription': '',
      'description': '',
      'model': '',
      'discoveryMethod': '',
      'version': '',
      'databaseServer': '',
    }
  }

  detailFormValidationMessages = {
    // 'name': {
    //   'required': 'Name is required'
    // },
    // 'management_ip': {
    //   'ip': 'Invalid IP'
    // }
  }

  buildServerForm(data: DatabaseEntityServerType): FormGroup {
    return this.builder.group({
      'Name': [{ value: data?.Name ?? '', disabled: true }],
      'SoftwareServerType': [{ value: data?.SoftwareServerType ?? '', disabled: true }],
      'VersionNumber': [{ value: data?.VersionNumber ?? '', disabled: true }],
      'Category': [{ value: data?.Category ?? '', disabled: true }],
      'Type': [{ value: data?.Type ?? '', disabled: true }],
      'Item': [{ value: data?.Item ?? '', disabled: true }],
      'ManufactureName': [{ value: data?.ManufactureName ?? '', disabled: true }],
      'Model': [{ value: data?.Model ?? '', disabled: true }],
      'MarketVersion': [{ value: data?.MarketVersion ?? '', disabled: true }],
      'TokenId': [{ value: data?.TokenId ?? '', disabled: true }],
      'EndOfLife': [{ value: data?.EndOfLife ?? '', disabled: true }],
      'EndOfSupport': [{ value: data?.EndOfSupport ?? '', disabled: true }],
      'EndOfSecuritySupport': [{ value: data?.EndOfSecuritySupport ?? '', disabled: true }],
      'EndOfExtendedSupport': [{ value: data?.EndOfExtendedSupport ?? '', disabled: true }],
      'ShortDescription': [{ value: data?.ShortDescription ?? '', disabled: true }],
      'Description': [{ value: data?.Description ?? '', disabled: true }],
    })
  }

}

export interface DatabaseEntityServerType {
  Name: string;
  SoftwareServerType: string;
  ShortDescription: string;
  Category: string;
  Type: string;
  Item: string;
  TokenId: string;
  Model: string;
  ManufactureName: string;
  VersionNumber: string;
  MarketVersion: string;
  Description: string;
  EndOfLife: string;
  EndOfSupport: string;
  EndOfSecuritySupport: string;
  EndOfExtendedSupport: string;
  SystemClassId: string;
  MarkAsDeleted: string;
  SystemName: string;
}