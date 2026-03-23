import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { UPDATE_VM_MGMT_IP } from 'src/app/shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class VmsMgmtCrudService {
  private addOrEditAnnouncedSource = new Subject<VMwareMgmtIPCRUD>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  updateMgmtIp(input: VMwareMgmtIPCRUD) {
    this.addOrEditAnnouncedSource.next(input);
  }

  createIpForm(input?: string): FormGroup {
    return this.builder.group({
      'management_ip': [input, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
    });
  }

  resetIpFormErrors() {
    return {
      'management_ip': ''
    };
  }

  ipValidationMessages = {
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  updateIp(data: { management_ip: string }, param: VMwareMgmtIPCRUD) {
    return this.http.put<{ management_ip: string }>(UPDATE_VM_MGMT_IP(param.vmId, param.vmType), data);
  }
}

export interface VMwareMgmtIPCRUD {
  vmId: string;
  mgmtIp: string;
  vmType: PlatFormMapping;
}