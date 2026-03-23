import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { environment } from 'src/environments/environment';
import { NCMConfigurationType, NCMDeviceVersionType } from './nc-compare.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class NcCompareService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDeviceVersions(deviceType: string, deviceId: string): Observable<NCMDeviceVersionType[]> {
    const apiDeviceType = this.getDeviceAPIMappingByURLDeviceType(deviceType);
    let params: HttpParams = new HttpParams().set('device_type', apiDeviceType).set('device_uuid', deviceId).set('is_encrypted', false);
    return this.http.get<PaginatedResult<NCMDeviceVersionType>>(`/customer/device_configuration/`, { params: params })
      .pipe(map(res => {
        let versions = res.results;
        let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
        versions.forEach(r => {
          // let versionDate = datePipe.transform(r.version_date.replace(/\s/g, "T"), environment.unityDateFormat);

          r.displayName = r.updated_at ? this.utilSvc.toUnityOneDateFormat(r.updated_at) : 'NA';
          // if (r.version_date) {
          //   r.displayName = `${r.version}_${datePipe.transform(r.version_date.replace(/\s/g, "T"), environment.unityDateFormat)}`
          // } else {
          //   r.displayName = `${r.version}`; 
          // }
        })
        return versions;
      }))
    // return this.http.get(`customer/${deviceType}/${deviceId}/oxidized/device_versions/`);
  }

  convertToNCMDeviceVersionViewData() {
    let vd: NCMDeviceVersionViewData[] = [];

  }

  buildForm(previous: NCMDeviceVersionType, current: NCMDeviceVersionType) {
    if (previous && current) {
      return this.builder.group({
        'device_name': [{ value: current.device_name, disabled: true }],
        'version1': [previous, [Validators.required]],
        'version2': [current, [Validators.required, RxwebValidators.different({ fieldName: "version1" })]]
      })
    } else {
      return this.builder.group({
        'device_name': [''],
        'version1': [null, [Validators.required]],
        'version2': [null, [Validators.required, RxwebValidators.different({ fieldName: "version1" })]]
      })
    }
  }

  formErrors() {
    return {
      'version1': '',
      'version2': ''
    };
  }

  validationMessages = {
    'version1': {
      'required': 'Version Selection is required'
    },
    'version2': {
      'required': 'Version Selection is required',
    }
  }

  getVersionData(versionId: string): Observable<Map<string, NCMConfigurationType>> {
    return this.http.get(`/customer/device_configuration/${versionId}/configuration/`).pipe(
      map((res: NCMConfigurationType) => {
        return new Map<string, NCMConfigurationType>().set(versionId, res);
      })
    )
  }

  getDeviceAPIMappingByURLDeviceType(deviceType: string): string {
    switch (deviceType) {
      case 'switch':
        return 'switch';
      case 'firewall':
        return 'firewall';
      case 'load-balancer':
        return 'load_balancer';
      default:
        return;
    }
  }
}

export class NCMDeviceVersionViewData {
  uuid: string;
  version: number;
  date: string;
  displayName: string;
  versionData: string;
}
