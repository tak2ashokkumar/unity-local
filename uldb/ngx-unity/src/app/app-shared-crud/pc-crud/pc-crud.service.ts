import { Injectable } from '@angular/core';
import { Subject, Observable, of, BehaviorSubject } from 'rxjs';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { VMware, Base, Vcloud, Openstack, Proxmox } from './pc-crud.type';
import { DataCenter } from '../../shared/../united-cloud/datacenter/tabs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DATA_CENTERS, ADD_PRIVATE_CLOUD, PRIVATE_CLOUD_BY_ID, PRIVATE_CLOUD_OTHER_DETAILS, PRIVATE_CLOUD_CHANGE_PASSWORD, CREATE_TASK_BY_CLOUD_ID_AND_PLATFORM, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { ServerSidePlatFormMapping, NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UserInfoService } from '../../shared/user-info.service';
import { PrivateCloudType } from '../../shared/SharedEntityTypes/private-cloud.type';

@Injectable({
  providedIn: 'root'
})
export class PcCrudService {
  private addOrEditAnnouncedSource = new Subject<{ pcId: string, dcId: string }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private changePasswordAnnouncedSource = new Subject<{ uuid: string, id: string, platformType: string }>();
  changePasswordAnnounced$ = this.changePasswordAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  private syncVMAnnouncedSource = new Subject<{ vmCount: number }>();
  syncVMAnnounced$ = this.syncVMAnnouncedSource.asObservable();

  private integrateAnnouncedSource = new Subject<string>();
  integrateAnnounced$ = this.integrateAnnouncedSource.asObservable();

  private vCenterDeleteAnnouncedSource = new Subject<string>();
  vCenterDeleteAnnounced$ = this.vCenterDeleteAnnouncedSource.asObservable();

  cloudName: string;

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService,
    private userInfo: UserInfoService) { }

  addOrEdit(pcId: string, dcId?: string) {
    this.addOrEditAnnouncedSource.next({ pcId: pcId, dcId: dcId ? dcId : null });
  }

  changePassword(uuid: string, id: string, platformType: string) {
    this.changePasswordAnnouncedSource.next({ uuid: uuid, id: id, platformType: platformType });
  }

  delete(pcId: string, cloudName?: string) {
    this.deleteAnnouncedSource.next(pcId);
    if(cloudName){
      this.cloudName = cloudName;
    }
  }

  // deleteVmwareVcenter(pcId: string) {
  //   this.vCenterDeleteAnnouncedSource.next(pcId);
  // }

  integratePrivateCloud(platformType: string) {
    this.integrateAnnouncedSource.next(platformType);
  }

  loadDatacenters(): Observable<DataCenter[]> {
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  getPrivateCloud(pcId: string): Observable<PrivateCloudType> {
    return this.http.get<PrivateCloudType>(PRIVATE_CLOUD_BY_ID(pcId));
  }

  addPrivateCloud(data: Base | VMware | Vcloud | Openstack | Proxmox) {
    return this.http.post(ADD_PRIVATE_CLOUD(), data);
  }

  updatePrivateCloud(pdId: string, data: Base | VMware | Vcloud | Openstack | Proxmox) {
    return this.http.put(PRIVATE_CLOUD_BY_ID(pdId), data);
  }

  syncPrivateCLoudVM(cloudId: string, platformType: PlatFormMapping): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(CREATE_TASK_BY_CLOUD_ID_AND_PLATFORM(cloudId, platformType))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
  }

  updateVMCount(count: number) {
    this.syncVMAnnouncedSource.next({ vmCount: count });
  }

  deletePrivateCloud(pdId: string) {
    if (!this.cloudName || this.cloudName == '') {
      return this.http.delete(PRIVATE_CLOUD_BY_ID(pdId));
    } else {
      return this.http.delete(`/customer/managed/${this.cloudName}/accounts/${pdId}/`);
    }
  }

  // deleteVcenterPrivateCloud(pdId: string) {
  //   return this.http.delete(`/customer/managed/vcenter/accounts/${pdId}/`);
  // }
  updatePassword(pdId: string, platformType: string, data: { [key: string]: string }) {
    return this.http.post(PRIVATE_CLOUD_CHANGE_PASSWORD(pdId, platformType), data);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  resetBaseFormErrors() {
    return {
      'platform_type': '',
      'name': '',
      'colocation_cloud': '',
      'collector': {
        'uuid': ''
      }
    };
  }
  resetvMFormFormErrors() {
    return {
      'hostname': '',
      'username': '',
      'password': '',
      'collector': {
        'uuid': ''
      }
    };
  }
  resetVCloudFormErrors() {
    return {
      'hostname': '',
      'username': '',
      'password': '',
      'vcloud_org': '',
      'collector': {
        'uuid': ''
      }
    };
  }
  resetOpenStackFormErrors() {
    return {
      'hostname': '',
      'username': '',
      'password': '',
      'project': '',
      'user_domain': '',
      'project_domain': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  resetProxmoxFormErrors() {
    return {
      'host_address': '',
      'username': '',
      'password': '',
      'domain': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  validationMessages = {
    baseFormMessages: {
      'platform_type': {
        'required': 'Cloud type is required'
      },
      'name': {
        'required': 'Cloud name is required'
      },
      'colocation_cloud': {
        'required': 'Datacenter is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    },
    vMFormMessages: {
      'hostname': {
        'required': 'Hostname is required'
      },
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    },
    openStackFormMessages: {
      'hostname': {
        'required': 'Hostname is required'
      },
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'project': {
        'required': 'Project is required'
      },
      'user_domain': {
        'required': 'User Domain is required'
      },
      'project_domain': {
        'required': 'Project Domain is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    },
    vCloudFormMessages: {
      'hostname': {
        'required': 'Hostname is required'
      },
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'vcloud_org': {
        'required': 'Organization is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    },
    proxmoxFormMessages: {
      'host_address': {
        'required': 'Host address is required'
      },
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'domain': {
        'required': 'Domain is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    }
  };

  createBaseForm(pcId: string, dcId: string): Observable<FormGroup> {
    if (pcId) {
      return this.http.get<PrivateCloudType>(PRIVATE_CLOUD_BY_ID(pcId)).pipe(
        map(pc => {
          let form = this.builder.group({
            'platform_type': [{ value: pc.platform_type, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'name': [pc.name, [Validators.required, NoWhitespaceValidator]],
            'colocation_cloud': [dcId ? { value: pc.colocation_cloud, disabled: true } : pc.colocation_cloud, [Validators.required, NoWhitespaceValidator]]
          })
          if (pc.platform_type == ServerSidePlatFormMapping.ESXI && this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [pc.collector ? pc.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          if (pc.platform_type == ServerSidePlatFormMapping.ESXI) {
            return this.addCollectorGroup(form, pc.collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'platform_type': ['', [Validators.required, NoWhitespaceValidator]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'colocation_cloud': [dcId ? { value: { uuid: dcId }, disabled: true } : '', [Validators.required, NoWhitespaceValidator]]
      }));
    }
  }

  addCollectorGroup(form: FormGroup, collectorData?: any) {
    if (this.userInfo.linkDeviceToCollector) {
      const collector = this.builder.group({
        'uuid': [collectorData ? collectorData.uuid : '', [Validators.required]],
      });
      form.addControl('collector', collector);
    }
    return form;
  }

  createVMWareForm(pcId: string): Observable<FormGroup> {
    if (pcId) {
      return this.http.get<VMware>(PRIVATE_CLOUD_OTHER_DETAILS(pcId, ServerSidePlatFormMapping.VMWARE)).pipe(map(vm => {
        let form = this.builder.group({
          'hostname': [vm.hostname, [Validators.required, NoWhitespaceValidator]],
          'username': [vm.username, [Validators.required, NoWhitespaceValidator]],
          'resource_pool_name': [vm.resource_pool_name, []],
        });
        if (vm.private_cloud && vm.private_cloud.collector) {
          return this.addCollectorGroup(form, vm.private_cloud.collector);
        } else {
          return this.addCollectorGroup(form);
        }
      }));
    } else {
      return of(this.builder.group({
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'resource_pool_name': ['', []],
      })).pipe(map(form => {
        return this.addCollectorGroup(form);
      }));
    }
  }

  createOpenStackForm(pcId: string): Observable<FormGroup> {
    if (pcId) {
      return this.http.get<Openstack>(PRIVATE_CLOUD_OTHER_DETAILS(pcId, ServerSidePlatFormMapping.OPENSTACK)).pipe(map(vm => {
        let form = this.builder.group({
          'hostname': [vm.hostname, [Validators.required, NoWhitespaceValidator]],
          'username': [vm.username, [Validators.required, NoWhitespaceValidator]],
          'project': [vm.project, [Validators.required, NoWhitespaceValidator]],
          'user_domain': [vm.user_domain, [Validators.required, NoWhitespaceValidator]],
          'project_domain': [vm.project_domain, [Validators.required, NoWhitespaceValidator]]
        });
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': [vm.private_cloud && vm.private_cloud.collector ? vm.private_cloud.collector.uuid : '', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    } else {
      return of(this.builder.group({
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'project': ['', [Validators.required, NoWhitespaceValidator]],
        'user_domain': ['', [Validators.required, NoWhitespaceValidator]],
        'project_domain': ['', [Validators.required, NoWhitespaceValidator]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
  }

  createvCloudForm(pcId: string): Observable<FormGroup> {
    if (pcId) {
      return this.http.get<Vcloud>(PRIVATE_CLOUD_OTHER_DETAILS(pcId, ServerSidePlatFormMapping.VCLOUD)).pipe(map(vm => {
        let form = this.builder.group({
          'hostname': [vm.endpoint, [Validators.required, NoWhitespaceValidator]],
          'username': [vm.username, [Validators.required, NoWhitespaceValidator]],
          'vcloud_org': [vm.vcloud_org, [Validators.required, NoWhitespaceValidator]]
        });
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': [vm.private_cloud && vm.private_cloud.collector ? vm.private_cloud.collector.uuid : '', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    } else {
      return of(this.builder.group({
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'vcloud_org': ['', [Validators.required, NoWhitespaceValidator]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
  }

  createProxmoxForm(type: ServerSidePlatFormMapping, pcId: string): Observable<FormGroup> {
    if (pcId) {
      return this.http.get<Proxmox>(PRIVATE_CLOUD_OTHER_DETAILS(pcId, type)).pipe(map(vm => {
        let form = this.builder.group({
          'host_address': [vm.host_address, [Validators.required, NoWhitespaceValidator]],
          'username': [vm.username, [Validators.required, NoWhitespaceValidator]],
        });
        if (type == ServerSidePlatFormMapping.HYPER_V) {
          form.addControl('domain', new FormControl(vm.domain ? vm.domain : '', [Validators.required, NoWhitespaceValidator]));
        }
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': [vm.private_cloud && vm.private_cloud.collector ? vm.private_cloud.collector.uuid : '', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    } else {
      return of(this.builder.group({
        'host_address': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]]
      })).pipe(map(form => {
        if (type == ServerSidePlatFormMapping.HYPER_V) {
          form.addControl('domain', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        }
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
  }

  passwordFormErrors() {
    return {
      'password': '',
      'confirm_password': ''
    };
  }

  passwordFormMessages = {
    'password': {
      'required': 'Password is required'
    },
    'confirm_password': {
      'required': 'Confirm password is required',
      'compare': 'Passwords must match'
    }
  }

  buildChangePassword(id: string) {
    return this.builder.group({
      'uuid': [id],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
    });
  }

  getPlarformType(pcType: string) {
    switch (pcType) {
      case 'esxi' : return ServerSidePlatFormMapping.ESXI;
      case 'vcloud' : return ServerSidePlatFormMapping.VCLOUD;
      case 'hyperv' : return ServerSidePlatFormMapping.HYPER_V;
      case 'openstack' : return ServerSidePlatFormMapping.OPENSTACK;
      case 'proxmox' : return ServerSidePlatFormMapping.PROXMOX;
      case 'unity-kvm' : return ServerSidePlatFormMapping.G3_KVM;
      default: console.error('Invalid cloud type : ', pcType);
    }
  }
}