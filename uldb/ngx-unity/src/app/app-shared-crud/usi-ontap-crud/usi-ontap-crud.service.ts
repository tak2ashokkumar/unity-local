import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, GET_ONTAP_CLUSTER, SAVE_ONTAP_CLUSTER, TENANT_TEMPLATES } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { MonitoringTemplate } from '../../shared/SharedEntityTypes/monitoring-templates.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable({
  providedIn: 'root'
})
export class UsiOntapCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(uuid: string) {
    this.addOrEditAnnouncedSource.next(uuid);
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getTemplates() {
    return this.http.get<MonitoringTemplate[]>(TENANT_TEMPLATES());
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'datacenter': {
        'uuid': ''
      },
      'is_cluster': '',
      'host_url': '',
      'username': '',
      'password': '',
      'port': '',
      'mtp_templates': '',
      'collector': {
        'uuid': ''
      }
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'host_url': {
      'required': 'Host URL is required'
    },
    'username': {
      'required': 'Username is required',
    },
    'password': {
      'required': 'Password is required'
    },
    'mtp_templates': {
      'required': 'Templates are required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  };

  buildForm(uuid: string): Observable<FormGroup> {
    if (uuid) {
      return this.http.get<OntapCrudFormdata>(GET_ONTAP_CLUSTER(uuid)).pipe(
        map(ontap => {
          return this.builder.group({
            'uuid': [ontap.uuid],
            'name': [ontap.name, [Validators.required, NoWhitespaceValidator]],
            'datacenter': this.builder.group({
              'uuid': [ontap.datacenter.uuid, [Validators.required, NoWhitespaceValidator]]
            }),
            'is_cluster': [ontap.is_cluster, [Validators.required, NoWhitespaceValidator]],
            'host_url': [ontap.host_url, [Validators.required, NoWhitespaceValidator]],
            'username': [ontap.username, [Validators.required, NoWhitespaceValidator]],
            'password': [ontap.password, [Validators.required, NoWhitespaceValidator]],
            'port': [ontap.port, [NoWhitespaceValidator]],
            'monitor': [false],
            'mtp_templates': [[],],
            'collector': this.builder.group({
              'uuid': [ontap.collector ? ontap.collector.uuid : '', [Validators.required]]
            }),
            'tags': [ontap.tags.filter(tg => tg)]
          });
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'is_cluster': [true, [Validators.required, NoWhitespaceValidator]],
        'host_url': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'port': [null, [NoWhitespaceValidator]],
        'management_ip': [''],
        'monitor': [false],
        'mtp_templates': [[],],
        'collector': this.builder.group({
          'uuid': ['', [Validators.required]]
        }),
        'tags': [[]]
      }));
    }
  }

  createOntap(data: OntapCrudFormdata): Observable<OntapCrudFormdata> {
    return this.http.post<OntapCrudFormdata>(SAVE_ONTAP_CLUSTER(), data);
  }

  updateOntap(uuid: string, data: OntapCrudFormdata): Observable<OntapCrudFormdata> {
    return this.http.put<OntapCrudFormdata>(GET_ONTAP_CLUSTER(uuid), data);
  }
}

export interface OntapCrudFormdata {
  uuid: string;
  name: string;
  datacenter: {
    uuid: string;
  }
  is_cluster: boolean,
  host_url: string;
  username: string;
  password: string;
  port: number;
  monitor: boolean;
  mtp_templates?: number[];
  collector: CollectorType;
  tags: string[];
}

export interface CollectorType {
  name: string;
  uuid: string;
}
