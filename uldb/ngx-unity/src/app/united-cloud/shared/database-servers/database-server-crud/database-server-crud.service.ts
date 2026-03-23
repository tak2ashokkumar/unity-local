import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_LIST_BY_DEVICE_TYPE, DB_SERVERS, DB_BMS, DB_PRIVATE_CLOUD_FAST, DB_TYPES } from 'src/app/shared/api-endpoint.const';
import { DatabaseCRUDPrivateCloudFast, DatabaseCRUDBMServerFast, DatabaseCRUDPrivateCloudVms, DatabaseCRUDDBType } from '../../entities/database-servers-crud.type';
import { DatabaseServer } from '../../entities/database-servers.type';

@Injectable()
export class DatabaseServerCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEditDBServer(dbIntanceId: string) {
    this.addOrEditAnnouncedSource.next(dbIntanceId);
  }

  deleteDBServer(dbIntanceId: string) {
    this.deleteAnnouncedSource.next(dbIntanceId);
  }

  getPrivateClouds(): Observable<DatabaseCRUDPrivateCloudFast[]> {
    return this.http.get<DatabaseCRUDPrivateCloudFast[]>(DB_PRIVATE_CLOUD_FAST());
  }

  getPrivateCloudVms(url: string): Observable<DatabaseCRUDPrivateCloudVms[]> {
    return this.http.get<DatabaseCRUDPrivateCloudVms[]>(`${url}&&page_size=0`);
  }

  getBmServers(): Observable<DatabaseCRUDBMServerFast[]> {
    return this.http.get<DatabaseCRUDBMServerFast[]>(DB_BMS());
  }

  getDBTypes(): Observable<DatabaseCRUDDBType[]> {
    return this.http.get<DatabaseCRUDDBType[]>(DB_TYPES());
  }

  createDbServerForm(dbIntanceId?: string): Observable<FormGroup> {
    if (dbIntanceId) {
      return this.http.get<DatabaseServer>(DB_SERVERS(dbIntanceId)).pipe(
        map(db => {
          let form = this.builder.group({
            'server_type': [{ value: db.server_type, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'db_instance_name': [db.db_instance_name, [Validators.required, NoWhitespaceValidator]],
            'db_type': [db.db_type ? db.db_type.id : '', [Validators.required, NoWhitespaceValidator]],
            'port': [db.port, [Validators.required, NoWhitespaceValidator]],
            'device_id': [''],
            'tags': [db.tags.filter(tg => tg)],
            'custom_attribute_data': [db.custom_attribute_data],
            'life_cycle_stage': [db.life_cycle_stage ? db.life_cycle_stage : 'Operational'],
            'life_cycle_stage_status' : [db.life_cycle_stage_status ? db.life_cycle_stage_status : 'In Use']
          });
          if (db.server_type == 'VMS') {
            form.addControl('private_cloud', new FormControl({ value: db.private_cloud ? db.private_cloud.id : '', disabled: true }, [Validators.required]));
            form.addControl('vm', new FormControl({ value: db.device_object ? db.device_object.device_id : '', disabled: true }, [Validators.required]));
          } else {
            form.addControl('bm_server', new FormControl({ value: db.device_object ? db.device_object.device_id : '', disabled: true }, [Validators.required]))
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'server_type': ['', [Validators.required, NoWhitespaceValidator]],
        'db_instance_name': ['', [Validators.required, NoWhitespaceValidator]],
        'db_type': ['', [Validators.required, NoWhitespaceValidator]],
        'port': ['', [Validators.required, NoWhitespaceValidator]],
        'device_id': [''],
        'tags': [[]],
        'life_cycle_stage': [{ value: 'Operational', disabled: true }],
        'life_cycle_stage_status': [{ value: 'In Use', disabled: true }]
      })).pipe(map(form => {
        return form;
      }));
    }
  }

  resetDBFormErrors() {
    return {
      'server_type': '',
      'private_cloud': '',
      'vm': '',
      'bm_server': '',
      'db_instance_name': '',
      'db_type': '',
      'port': '',
      'username': '',
      'password': '',
      'database_name': '',
      'life_cycle_stage' : '',
      'life_cycle_stage_status': ''
    };
  }

  dbFormValidationMessages = {
    'server_type': {
      'required': 'Database Server type is required'
    },
    'private_cloud': {
      'required': 'Private cloud has to be selected'
    },
    'vm': {
      'required': 'Virtual Machine has to be selected'
    },
    'bm_server': {
      'required': 'Baremetal Server has to be selected'
    },
    'db_instance_name': {
      'required': 'Instance name is required'
    },
    'db_type': {
      'required': 'Database type is required'
    },
    'port': {
      'required': 'Port is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'database_name': {
      'required': 'Database name is required'
    },
    'life_cycle_stage': {
      'required': 'Life Cycle Stage is required'
    },
    'life_cycle_stage_status': {
      'required': 'Life Cycle Stage Status is required'
    },
  }

  convertToFormData(dbTypes: DatabaseCRUDDBType[], formData: any): DatabaseServerCRUDForm {
    formData.db_type = dbTypes.find(db => db.id == formData.db_type);
    let fd = <DatabaseServerCRUDForm>Object.assign({}, formData);
    if (formData.private_cloud) {
      fd.private_cloud = { id: formData.private_cloud }
      fd.device_id = formData.vm;
    } else {
      fd.device_id = formData.bm_server;
    }
    delete fd.vm;
    delete fd.bm_server;
    return fd;
  }

  createDB(data: DatabaseServerCRUDForm): Observable<any[]> {
    return this.http.post<any[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER), data);
  }

  deleteDB(dbInstanceId: string): Observable<any> {
    return this.http.delete(DB_SERVERS(dbInstanceId));
  }

  updateDB(data: DatabaseServerCRUDForm, dbInstanceId: string): Observable<any[]> {
    return this.http.patch<any[]>(DB_SERVERS(dbInstanceId), data);
  }
}

// export const dbServerTypes: string[] = [
//   'MySQL',
//   'MSSQL Server',
//   'Oracle',
//   'PostgreSQL'
// ]

export class DatabaseServerCRUDForm {
  server_type: string;
  private_cloud?: { id: number };
  vm?: number;
  bm_server?: number
  device_id: DatabaseCRUDDBType;
  db_instance_name: string;
  db_type: string;
  port: number;
  username: string;
  password?: string;
  database_name: string;
  custom_attribute_data: { [key: string]: any };
  constructor() { }
}
