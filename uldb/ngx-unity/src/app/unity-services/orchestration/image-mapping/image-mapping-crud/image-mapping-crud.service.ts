import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { FIREWALL_PRIVATE_CLOUD_FAST, PRIVATE_CLOUDS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { FileInfo, OSInfo, StorageInfo, VMImage } from './image-mapping-type';

@Injectable()
export class ImageMappingCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getMappingDataById(imageMappingId: string): Observable<VMImage> {
    return this.http.get<VMImage>(`orchestration/vmimage/${imageMappingId}/`);
  }

  getDropdownData(): Observable<{ clouds: PrivateCLoudFast[], osInfo: OSInfo[] }> {
    return forkJoin({
      clouds: this.getClouds().pipe(catchError(error => of(undefined))),
      osInfo: this.getOSInfo().pipe(catchError(error => of(undefined))),
    });
  }

  getClouds(): Observable<PrivateCLoudFast[]> {
    return this.http.get<PrivateCLoudFast[]>(`customer/private_cloud_fast/?platform_type=VMware&page_size=0`);
  }

  getOSInfo(): Observable<OSInfo[]> {
    return this.http.get<OSInfo[]>(`/orchestration/vmimage/os_list/`);
  }

  getDataStoreList(cloudId: string): Observable<StorageInfo[]> {
    return this.http.get<StorageInfo[]>(`/customer/private_cloud/${cloudId}/datastore_list/`)
  }

  getContentList(cloudId: string, datastorename: string): Observable<FileInfo[]> {
    return this.http.get<FileInfo[]>(`/customer/private_cloud/${cloudId}/retrieve_datastore_files/?datastore=${datastorename}`);
  }

  getTemplates(cloudId: string): Observable<any> {
    return this.http.get<any>(`orchestration/vmimage/${cloudId}/vm_templates/`);
  }

  testConnection(path: string) {
    let obj = {
      os_image_path: path
    }
    return this.http.post<any>(`/orchestration/vmimage/test_connection/`, obj)
  }

  updateTask(imageMappingId: string, data: VMImage) {
    return this.http.put<VMImage>(`orchestration/vmimage/${imageMappingId}/`, data);
  }

  createTask(obj: VMImage): Observable<VMImage> {
    return this.http.post<VMImage>(`orchestration/vmimage/`, obj);
  }


  buildForm(mappingData: any): FormGroup {
    if (mappingData) {
      let form = this.builder.group({
        'name': [mappingData.name, [Validators.required]],
        'description': [mappingData.description],
        'os_type': [mappingData.os_type, [Validators.required]],
        'os_name': [mappingData.os_name, [Validators.required]],
        'os_version': [mappingData.os_version, [Validators.required]],
        'os_edition': [mappingData.os_edition, [Validators.required]],
        'min_memory': [mappingData.min_memory, [Validators.required]],
        'min_vcpu': [mappingData.min_vcpu, [Validators.required]],
        'username': [mappingData.username, [Validators.required]],
        'password': [mappingData.password, [Validators.required]],
      })
      if (mappingData.location != null) {
        form.addControl('location', new FormControl(mappingData.location, [Validators.required]));
        form.addControl('storage_type', new FormControl(mappingData.storage_type, [Validators.required]));
        // form.addControl('datastore_name', new FormControl(mappingData.datastore_name, [Validators.required]));
        // form.addControl('file_path', new FormControl(mappingData.file_path, [Validators.required]));
      } else {
        form.addControl('location', new FormControl('Other', [Validators.required]));
        form.addControl('file_path', new FormControl(mappingData.file_path, [Validators.required]));
      }
      if (mappingData?.storage_type === 'Datastore') {
        form.addControl('datastore_name', new FormControl(mappingData.datastore_name, [Validators.required]));
        form.addControl('file_path', new FormControl(mappingData.file_path, [Validators.required]));
      } else {
        form.addControl('file_path', new FormControl(mappingData.file_path, [Validators.required]));
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'description': [''],
        'os_type': ['', [Validators.required]],
        'os_name': [{ value: '', disabled: true }, [Validators.required]],
        'os_version': [{ value: '', disabled: true }, [Validators.required]],
        'os_edition': [{ value: '', disabled: true }, [Validators.required]],
        'min_memory': ['', [Validators.required]],
        'min_vcpu': ['', [Validators.required]],
        'username': ['', [Validators.required]],
        'password': ['', [Validators.required]],
        'location': ['', [Validators.required]],
        'storage_type': ['', [Validators.required]],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'os_type': '',
      'os_name': '',
      'os_version': '',
      'os_edition': '',
      'min_memory': '',
      'min_vcpu': '',
      'username': '',
      'password': '',
      'location': '',
      'storage_type': '',
      'datastore_name': '',
      'file_path': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'os_type': {
      'required': 'OS Type is required'
    },
    'os_name': {
      'required': 'OS Name is required'
    },
    'os_version': {
      'required': 'OS Version is required'
    },
    'os_edition': {
      'required': 'OS Edition is required'
    },
    'min_memory': {
      'required': 'OS Memory is required'
    },
    'min_vcpu': {
      'required': 'VCPU is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'location': {
      'required': 'location is required'
    },
    'storage_type': {
      'required': 'storage Type is required'
    },
    'file_path': {
      'required': 'OS File Path is Required'
    },
    'datastore_name': {
      'required': 'DataStore name is Required'
    },
  }
}
