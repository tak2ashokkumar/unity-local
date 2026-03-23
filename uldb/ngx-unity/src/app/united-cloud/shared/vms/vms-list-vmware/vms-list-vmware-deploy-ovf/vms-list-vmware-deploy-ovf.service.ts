import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, of, range, throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { AppLevelService, FileChunkType } from 'src/app/app-level.service';
import { DEPLOY_OVF_TEMPLATE, UPLOAD_FILE_IN_CHUNKS, UPLOAD_OVF_VMDK_FILE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DEPLOY_OVF_TEMPLATE_STEPS, OVFDeployAllStepsDataType, OVFDeployWizardStepType, VcenterOVFDeployClusterItem, VcenterOVFDeployMetaData } from './vms-list-vmware-deploy-ovf.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Injectable()
export class VmsListVmwareDeployOvfService {

  private deployAnnouncedSource = new Subject();
  deployAnnounced$ = this.deployAnnouncedSource.asObservable();

  deployOVF() {
    this.deployAnnouncedSource.next();
  }

  constructor(private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private http: HttpClient,
    private notification: AppNotificationService) { }

  uploadFileDefault() {
    return {
      files: {},
      uploadedVmdkFiles: [],
      vmdkCount: 0,
      ovfFileError: '',
      vmdkFileError: '',
      uploadedResponse: ''
    }
  }

  nameAndFolderDefault() {
    return {
      name: '',
      nameError: '',
      destination: '',
      destinationError: ''
    }
  }

  computeResourceDefault() {
    return {
      computeResource: '',
      computeResourceError: '',
    }
  }

  storageDefault() {
    return {
      diskProvision: 'Thick Provision Lazy Zerored',
      storage: [],
      storageError: ''
    }
  }

  networkDefault() {
    return {
      network: '',
      networkError: '',
    }
  }

  resetStepDataToDefault(stepName: string, mainData: OVFDeployAllStepsDataType) {
    switch (stepName) {
      case DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES:
        mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES] = this.uploadFileDefault();
        return mainData;

      case DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER:
        mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER] = this.nameAndFolderDefault();
        return mainData;

      case DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE:
        mainData[DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE] = this.computeResourceDefault();
        return mainData;

      case DEPLOY_OVF_TEMPLATE_STEPS.STORAGE:
        mainData[DEPLOY_OVF_TEMPLATE_STEPS.STORAGE] = this.storageDefault();
        return mainData;

      case DEPLOY_OVF_TEMPLATE_STEPS.REVIEW:
        return mainData;

      case DEPLOY_OVF_TEMPLATE_STEPS.NETWORK:
        mainData[DEPLOY_OVF_TEMPLATE_STEPS.NETWORK] = this.networkDefault();
        return mainData;
    }
  }

  validateUploadFile(data: any) {
    let isOvfValid = false;
    let isVmdkValid = false;
    let ovfCount = 0;
    Object.entries(<{ [key: string]: any }>data.files).forEach(entry => {
      const [key, value] = entry;
      if (key.endsWith('ovf')) {
        isOvfValid = true;
        ovfCount++;
        if (ovfCount > 1) {
          isOvfValid = false;
        }
      }
      if (key.endsWith('vmdk')) {
        isVmdkValid = true;
      }
    })
    let isvalid = isOvfValid && isVmdkValid;
    if (isvalid) {
      data.ovfFileError = '';
      data.vmdkFileError = '';
      return true;
    } else {
      if (!isOvfValid) {
        if (ovfCount > 1) {
          data.ovfFileError = 'Cannot upload more than 1 OVF file';
        } else {
          data.ovfFileError = 'OVF file is required';
        }
      } else {
        data.ovfFileError = '';
      }
      if (!isVmdkValid) {
        data.vmdkFileError = 'VMDK file is required';
      } else {
        data.vmdkFileError = '';
      }
      return false;
    }
  }

  validateName(data: any) {
    if (!data.name) {
      data.nameError = 'VM name is required';
    } else {
      data.nameError = '';
    }
  }

  validateFolder(data: any) {
    if (!data.destination) {
      data.destinationError = 'Folder is required';
    } else {
      data.destinationError = '';
    }
  }

  private validateNameAndFolder(mainData: OVFDeployAllStepsDataType) {
    let data = mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER];
    if (data.name && data.destination) {
      data.nameError = '';
      data.destinationError = '';
      return true;
    }
    this.validateName(data);
    this.validateFolder(data);
    return false;
  }

  validateComputeResource(mainData: OVFDeployAllStepsDataType) {
    let data = mainData[DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE];
    if (data.computeResource) {
      data.computeResourceError = '';
      return true;
    }
    data.computeResourceError = 'Compute resource is required';
    return false;
  }

  validateStorage(mainData: OVFDeployAllStepsDataType) {
    let data = mainData[DEPLOY_OVF_TEMPLATE_STEPS.STORAGE];
    if (data.storage.length) {
      data.storageError = '';
      return true;
    }
    data.storageError = 'Storage is required';
    return false;
  }

  validateNetwork(mainData: OVFDeployAllStepsDataType) {
    let data = mainData[DEPLOY_OVF_TEMPLATE_STEPS.NETWORK];
    if (!data.network) {
      data.networkError = 'Network is required';
      return false;
    } else {
      data.networkError = '';
      return true;
    }
  }

  isValidStep(stepName: string, mainData: OVFDeployAllStepsDataType) {
    switch (stepName) {

      case DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER:
        return this.validateNameAndFolder(mainData);

      case DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE:
        return this.validateComputeResource(mainData);

      case DEPLOY_OVF_TEMPLATE_STEPS.STORAGE:
        return this.validateStorage(mainData);

      case DEPLOY_OVF_TEMPLATE_STEPS.NETWORK:
        return this.validateNetwork(mainData);

      case DEPLOY_OVF_TEMPLATE_STEPS.REVIEW:
        return true;
    }
  }

  convertToNameAndFolderTypeTreeNode(data: VcenterOVFDeployMetaData[]) {
    let arr: UnityDeployOvfTreeViewNodeType[] = [];
    let hostNode = new UnityDeployOvfTreeViewNodeType();
    hostNode.name = data[0].host;
    hostNode.canSelect = false;
    hostNode.children = [];
    data.map(d => {
      let dcNode = new UnityDeployOvfTreeViewNodeType();
      dcNode.name = d.datacenter;
      dcNode.canSelect = true;
      hostNode.children.push(dcNode);
    })
    arr.push(hostNode);
    return arr;
  }

  convertClusterTypeToTreeNode(dc: string, clusters: VcenterOVFDeployClusterItem[]): UnityDeployOvfTreeViewNodeType[] {
    let arr: UnityDeployOvfTreeViewNodeType[] = [];
    clusters.forEach(cluster => {
      let node = new UnityDeployOvfTreeViewNodeType();
      node.name = cluster.name;
      if (cluster.pool_data.length) {
        let pools: UnityDeployOvfTreeViewNodeType[] = [];
        cluster.pool_data.forEach(pool => {
          let cn = new UnityDeployOvfTreeViewNodeType();
          cn.name = pool;
          cn.canSelect = true;
          pools.push(cn);
        });
        node.children = pools;
      }
      arr.push(node);
    });
    let dcNode = new UnityDeployOvfTreeViewNodeType();
    dcNode.name = dc;
    dcNode.children = arr;
    return [dcNode];
  }

  uploadFileInChunkedSequence(chunkSize: number, file: File): Observable<any> {
    let previousResponse: any = null;
    const finalResponseSubject = new Subject<any>();

    let chunks = [];
    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({ start, end });
    }

    return range(0, chunks.length).pipe(
      concatMap((callNumber) => {
        const chunk: Blob = file.slice(chunks[callNumber].start, chunks[callNumber].end);
        const formData = new FormData();
        formData.set('file', chunk, file.name);
        formData.set('offset', (chunks[callNumber].end).toString());
        if (callNumber > 0) {
          // Get the response from the previous call
          formData.set('upload_id', previousResponse.response.upload_id);
        }
        let headers = new HttpHeaders({
          'Content-Range': `bytes ${chunks[callNumber].start}-${chunks[callNumber].end - 1}/${file.size}`
        });

        return this.http.post<FileChunkType>(UPLOAD_FILE_IN_CHUNKS(), formData, { headers: headers }).pipe(
          map((res) => {
            if (!res || (res && !res.upload_id)) {
              previousResponse = null;
              throwError('API response is invalid.');
            } else {
              previousResponse = { response: res, file: file.name, current: callNumber, total: chunks.length - 1 };
            }
            return previousResponse;
          })
        );
      })
      // finalize(() => {

      // })
    )
    // .subscribe({
    //   next: (previousResponse) => {
    //     if (previousResponse) {
    //       console.log('previousResponse : ', previousResponse)
    //       finalResponseSubject.next(previousResponse);
    //     } else {
    //       finalResponseSubject.error('API request failed.'); // Emit error in case of API failure
    //     }
    //     if(previousResponse.current == previousResponse.total){

    //     }
    //     finalResponseSubject.complete();
    //   },
    //   error: (error) => {
    //     // Handle the error here
    //     console.error(error);
    //   },
    // });

    // return finalResponseSubject;
  }

  saveFileInChunks(formData: FormData, headers: HttpHeaders) {
    return this.http.post<FileChunkType>(UPLOAD_FILE_IN_CHUNKS(), formData, { headers: headers })
  }

  saveLargeFile() {
    return this.http.get(`https://ipinfo.io/209.237.230.158/geo`);
    // return this.http.post<CeleryTask>(UPLOAD_LARGE_FILE_TO_VCENTER_CONTENT_LIBRARY(pcId), { 'lib_id': libId, 'upload_id': uploadId, 'file_name': itemName, 'item_type': fileName.split('.').pop() });
  }

  uploadFiles(pcId: string, cloudName: string, data: { key: string, value: any }) {
    // let o = {};
    // if (key.endsWith('ovf')) {
    //   o = {
    //     "ovf_data": {
    //       "disk": {
    //         "populated_size": "1.1 GB (thin provisioned)",
    //         "capacity": "8GB (thick provisioned)"
    //       },
    //       "vmdk": {
    //         "size": "382.1 MB"
    //       },
    //       "vm_network": "VM Network"
    //     },
    //     "file_path": "media/content_library_files/0104bd76-2163-4ec1-8b51-653571664005/",
    //     "ovf_file_name": "ubuntu-server-12.04-i386.ovf"
    //   };
    // } else if (key.endsWith('vmdk')) {
    //   o = {
    //     "vmdk_file_name": "ubuntu-server-12.04-i386-disk1.vmdk",
    //     "file_path": "media/content_library_files/c199b8df-2fa1-40a7-9150-543e0b75fe79/ubuntu-server-12.04-i386-disk1.vmdk"
    //   }
    // }
    let fd = new FormData();
    if (data.key.endsWith('ovf')) {
      fd.set('ovf_file', data.value.file);
    } else if (data.key.endsWith('vmdk')) {
      fd.set('vmdk_file', data.value.file);
    }
    return this.http.post(UPLOAD_OVF_VMDK_FILE(pcId, cloudName), fd).pipe(
      map((res: any) => {
        return new Map<string, any>().set(data.key, res);
      }),
      catchError((error: HttpErrorResponse) => {
        this.notification.error(new Notification(error.error.detail));
        return of(new Map<string, any>().set(data.key, null));
      })
    );
    // return of(<any>{
    //   "ovf_data": {
    //     "disk": {
    //       "populated_size": "1.1 GB (thin provisioned)",
    //       "capacity": "8GB (thick provisioned)"
    //     },
    //     "vmdk": {
    //       "size": "382.1 MB"
    //     },
    //     "vm_network": "VM Network"
    //   },
    //   "vmdk_file_name": "ubuntu-server-12.04-i386-disk1.vmdk",
    //   "file_path": "media/content_library_files/bf216b5f-b1dc-4170-bb54-1b4be524c93f/",
    //   "ovf_file_name": "ubuntu-server-12.04-i386.ovf"
    // })
    // return this.http.post<any>(UPLOAD_OVF_VMDK_FILE(pcId), this.createFormData(data.files));
  }

  convertToVMCreationData(mainData: OVFDeployAllStepsDataType) {
    return {
      'file_path': mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].uploadedResponse.file_path,
      'ovf_file_name': mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].uploadedResponse.ovf_file_name,
      'vmdk_upload_id': mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].uploadedVmdkFiles,
      'datastore': mainData[DEPLOY_OVF_TEMPLATE_STEPS.STORAGE].storage[0].name,
      'vm_name': mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER].name,
      'datacenter': mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER].destination,
      'resourcepool': mainData[DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE].computeResource,
      'network': mainData[DEPLOY_OVF_TEMPLATE_STEPS.NETWORK].network,
      'disk_provision': mainData[DEPLOY_OVF_TEMPLATE_STEPS.STORAGE].diskProvision
    }

  }

  deployTemplate(pcId: string, cloudName: string, data: any) {
    return this.http.post<CeleryTask>(DEPLOY_OVF_TEMPLATE(pcId, cloudName), data);
  }
}


export const DEPLOY_OVF_WIZARD_STEPS: OVFDeployWizardStepType[] = [
  {
    icon: 'fas fa-link',
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES,
    active: false,
    visited: false
  },
  {
    icon: 'fas fa-poll',
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER,
    active: false,
    visited: false
  },
  {
    icon: 'fa fa-database',
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE,
    active: false,
    visited: false
  },
  {
    icon: 'fa fa-clipboard',
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.REVIEW,
    active: false,
    visited: false
  },
  {
    icon: `fa ${FaIconMapping.STORAGE_DEVICE}`,
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.STORAGE,
    active: false,
    visited: false
  },
  {
    icon: `fa ${FaIconMapping.SWITCH}`,
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.NETWORK,
    active: false,
    visited: false
  },
  {
    icon: `fa fa-clipboard`,
    stepName: DEPLOY_OVF_TEMPLATE_STEPS.SUMMARY,
    active: false,
    visited: false
  }
]

export class UnityDeployOvfTreeViewNodeType {
  name: string;
  children?: UnityDeployOvfTreeViewNodeType[];
  constructor() { }

  isOpened?: boolean = false;
  canSelect: boolean = false;
  isSelected: boolean = false;

  hasChildren() {
    return this.children && this.children.length;
  }

  toggle() {
    if (this.hasChildren()) {
      this.isOpened = !this.isOpened;
    }
  }

  getIcon() {
    if (this.hasChildren()) {
      if (this.isOpened) {
        return 'fas fa-angle-down';
      }
      return 'fas fa-angle-right';
    }
    return '';
  }
}
