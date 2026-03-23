import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_VCENTER_CONTENT_LIBRARIES, GET_VCENTER_CONTENT_LIBRARY_FILES, GET_VCENTER_VM_ISO_LIST, UPDATE_VCENTER_VM, VCENTER_VM_HARDWARE_DETAILS, VCENTER_VM_PROVISION } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { ADD_VM_STEPS, AddVMWizardStepType, AllStepsDataType, VcenterVMCreateClusterItem, VcenterVMCreateSummary, VcenterVMCreationMetaData } from './vms-list-vmware-add.type';

@Injectable()
export class VmsListVmwareAddService {
  private addVMAnnouncedSource = new Subject();
  addVMAnnounced$ = this.addVMAnnouncedSource.asObservable();

  private editVMConfigAnnouncedSource = new Subject<{ uuid: string, name: string }>();
  editVMConfigAnnounced$ = this.editVMConfigAnnouncedSource.asObservable();

  constructor(private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private http: HttpClient) { }

  addVM() {
    this.addVMAnnouncedSource.next();
  }

  editVM(uuid: string, name: string) {
    this.editVMConfigAnnouncedSource.next({ uuid: uuid, name: name });
  }

  getISOList(pcId: string, stgName: string) {
    let params = new HttpParams().set('datastore', stgName);
    return this.http.get<{ file_name: string, file_path: string }[]>(GET_VCENTER_VM_ISO_LIST(pcId), { params: params });
    // return of([{ "file_name": "debian-11.3.0-amd64-DVD-1.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] debian-11.3.0-amd64-DVD-1.iso" }, { "file_name": "en-us_windows_server_2019_updated_jul_2021_x64_dvd_01319f3c.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] en-us_windows_server_2019_updated_jul_2021_x64_dvd_01319f3c.iso" }, { "file_name": "ubuntu-20.04.2-live-server-amd64.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] ubuntu-20.04.2-live-server-amd64.iso" }])
  }

  getLibraryISOList(pcId: string, libId: string) {
    return this.http.get<CeleryTask>(GET_VCENTER_CONTENT_LIBRARY_FILES(pcId, libId));
    // return of([{ "file_name": "debian-11.3.0-amd64-DVD-1.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] debian-11.3.0-amd64-DVD-1.iso" }, { "file_name": "en-us_windows_server_2019_updated_jul_2021_x64_dvd_01319f3c.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] en-us_windows_server_2019_updated_jul_2021_x64_dvd_01319f3c.iso" }, { "file_name": "ubuntu-20.04.2-live-server-amd64.iso", "file_path": "[PURE_DS_TEMPLATES_ISO] ubuntu-20.04.2-live-server-amd64.iso" }])
  }

  // getLibraries(pcId: string) {
  //   return this.http.get<CeleryTask>(GET_VCENTER_CONTENT_LIBRARIES(pcId));
  // }

  // getVcenterLibraries(pcId: string) {
  //   return this.http.get<CeleryTask>(`/customer/managed/vcenter/accounts/${pcId}/list_content_library/`);
  // }

  getLibraries(pcId: string, cloudName: string) {
    if (cloudName === '') {
      return this.http.get<CeleryTask>(GET_VCENTER_CONTENT_LIBRARIES(pcId));
    } else {
      return this.http.get<CeleryTask>(`/customer/managed/${cloudName}/accounts/${pcId}/list_content_library/`);
    }
  }

  createVM(pcId: string, cloudName: string, data: VcenterVMCreationData) {
    return this.http.post<CeleryTask>(VCENTER_VM_PROVISION(pcId, cloudName), data);
  }

  creationTypeDeafult() {
    return {
      creation_type: '',
      error: ''
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
      computeResourceType: '',
      computeResourceError: '',
    }
  }

  storageDefault() {
    return {
      storage: [],
      storageError: ''
    }
  }

  guestOSDefault() {
    return {
      guestOS: 'windows',
      guestOSVersion: '',
      guestOSVersionError: '',
    }
  }

  hardDiskDefault() {
    return {
      hardDisk: 40,
      hardDiskUnit: 'GB',
      hardDiskMax: 0,
      hardDiskError: '',
      diskProvision: 'Thick Provision Lazy Zerored',
      hardDiskExpand: false,
      controller: 'SCSI controller 0'
    }
  }

  networkDefault() {
    return {
      network: '',
      networkError: '',
    }
  }

  harwareDefault() {
    return {
      cpu: 1,
      cpuExpand: false,
      cpuHotAdd: false,
      memory: 4,
      memoryUnit: 'MB',
      memoryError: '',
      memoryExpand: false,
      memoryHotAdd: false,
      hardDisk: [this.hardDiskDefault()],
      hardDiskError: '',
      network: [this.networkDefault()],
      scsiControllers: [{
        'label': 'SCSI controller 0',
        'value': 'VirtualLsiLogicSASController'
      }],
      sataControllers: [{
        'label': 'SATA controller 0',
        'value': 'SATA controller 0'
      }],
      nvmeControllers: [],
      usbControllers: [],
      boot_option: '',
      iso_storage: '',
      library_storage: '',
      iso: '',
      isoError: '',
      vcExpand: false,
      vcSettings: 'auto_detect',
      vcSettingsErr: '',
      vcNumDisplay: 1,
      vcNumDisplayErr: '',
      vcRamSize: 2,
      vcRamSizeErr: ''
    }
  }

  resetStepDataToDefault(stepName: string, mainData: AllStepsDataType) {
    switch (stepName) {
      case ADD_VM_STEPS.CREATION_TYPE:
        mainData[ADD_VM_STEPS.CREATION_TYPE] = this.creationTypeDeafult();
        return mainData;

      case ADD_VM_STEPS.NAME_AND_FOLDER:
        mainData[ADD_VM_STEPS.NAME_AND_FOLDER] = this.nameAndFolderDefault();
        return mainData;

      case ADD_VM_STEPS.COMPUTE_RESOURCE:
        mainData[ADD_VM_STEPS.COMPUTE_RESOURCE] = this.computeResourceDefault();
        return mainData;

      case ADD_VM_STEPS.STORAGE:
        mainData[ADD_VM_STEPS.STORAGE] = this.storageDefault();
        return mainData;

      case ADD_VM_STEPS.GUEST_OS:
        mainData[ADD_VM_STEPS.GUEST_OS] = this.guestOSDefault();
        return mainData;

      case ADD_VM_STEPS.HARDWARE:
        mainData[ADD_VM_STEPS.HARDWARE] = this.harwareDefault();
        return mainData;
    }
  }

  private validateCreationType(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.CREATION_TYPE];
    if (!data.creation_type) {
      data.error = 'Creation Type is required';
      return false;
    }
    data.error = '';
    return true;
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

  private validateNameAndFolder(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.NAME_AND_FOLDER];
    if (data.name && data.destination) {
      data.nameError = '';
      data.destinationError = '';
      return true;
    }
    this.validateName(data);
    this.validateFolder(data);
    return false;
  }

  validateComputeResource(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.COMPUTE_RESOURCE];
    if (data.computeResource) {
      data.computeResourceError = '';
      return true;
    }
    data.computeResourceError = 'Compute resource is required';
    return false;
  }

  validateStorage(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.STORAGE];
    if (data.storage.length) {
      data.storageError = '';
      return true;
    }
    data.storageError = 'Storage is required';
    return false;
  }

  validateOS(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.GUEST_OS];
    if (data.guestOSVersion) {
      data.guestOSVersionError = '';
      return true;
    }
    data.guestOSVersionError = 'Guest OS is required';
    return false;
  }

  validateHardwareMemory(data: any) {
    if (!data.memory) {
      data.memoryError = 'Memory is required';
      return false;
    } else if (data.memoryUnit == 'MB') {
      if (data.memory < 4) {
        data.memoryError = 'Memory cannot be less than 4MB';
        return false;
      } else if (data.memory > 24560000) {
        data.memoryError = 'Memory cannot be more than 24560000 MB';
        return false;
      } else {
        data.memoryError = '';
        return true;
      }
    } else if (data.memoryUnit == 'GB' && data.memory > 24560) {
      data.memoryError = 'Memory cannot be more than 24560 GB';
      return false;
    } else {
      data.memoryError = '';
      return true;
    }
  }

  validateHardwareDisk(data: any, storageSummary: VcenterVMCreateSummary) {
    if (!data.hardDisk) {
      data.hardDiskError = 'Disk capacity is required';
      return false;
    } else if (this.utilSvc.convertSizeToBytes(data.hardDisk, data.hardDiskUnit) > storageSummary.freespaceInBytes) {
      data.hardDiskError = 'Disk capacity cannot be greater than available in datastore';
      return false;
    }
    data.hardDiskError = '';
    return true;
  }

  validateHardwareDisks(data: any, storageSummary: VcenterVMCreateSummary) {
    let isValid = false;
    let count = 0;
    let total = 0;
    data.hardDisk.forEach(hd => {
      this.validateHardwareDisk(hd, storageSummary) ? count++ : count;
      total += this.utilSvc.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit);
    });
    if (count == data.hardDisk.length) {
      isValid = true;
    } else {
      isValid = false;
    }
    if (isValid && total > storageSummary.freespaceInBytes) {
      data.hardDiskError = 'Total disk capacity cannot be greater than available in datastore';
      isValid = false;
    }
    return isValid;
  }

  validateHardwareNetwork(data: any) {
    if (!data.network) {
      data.networkError = 'Network is required';
      return false;
    } else {
      data.networkError = '';
      return true;
    }
  }

  validateHardwareNetworks(data: any) {
    let isValid = false;
    let count = 0;
    data.network.forEach(nw => this.validateHardwareNetwork(nw) ? count++ : count);
    if (count == data.network.length) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid;
  }

  validateHardwareISO(data: any) {
    if (data.boot_option == 'datastore iso' || data.boot_option == 'content library iso') {
      if (!data.iso) {
        data.isoError = 'ISO file is required';
        return false;
      } else {
        data.isoError = '';
        return true;
      }
    } else if (data.boot_option == '') {
      data.isoError = '';
      return true;
    }
  }

  validateVideoCard(data: any) {
    if (data.vcSettings == 'custom') {
      data.vcRamSizeErr = '';
      let isValid = true;
      if (!data.vcNumDisplay) {
        data.vcNumDisplayErr = 'Invalid number of display';
        isValid = false;
      }
      if (!data.vcRamSize) {
        data.vcRamSizeErr = 'Ram size is required';
        isValid = false;
      } else if (data.vcRamSize < 1.172) {
        data.vcRamSizeErr = 'Video memory cannot be less than 1.172 MB';
        isValid = false;
      } else if (data.vcRamSize > 256) {
        data.vcRamSizeErr = 'Video memory cannot be more than 256 MB';
        isValid = false;
      }
      if (!isValid) {
        data.vcExpand = true;
      }
      return isValid;
    } else {
      return true;
    }
  }

  private validateHardware(mainData: AllStepsDataType) {
    let data = mainData[ADD_VM_STEPS.HARDWARE];
    let isValidMemory = this.validateHardwareMemory(data);
    let isValidDisk = this.validateHardwareDisks(data, mainData[ADD_VM_STEPS.STORAGE].storage[0]?.summary);
    let isValidNetwork = this.validateHardwareNetworks(data);
    let isValidISO = this.validateHardwareISO(data);
    let isValidVideo = this.validateVideoCard(data);
    if (isValidMemory && isValidDisk && isValidNetwork && isValidISO && isValidVideo) {
      return true;
    }
    return false;
  }

  isValidStep(stepName: string, mainData: AllStepsDataType) {
    switch (stepName) {
      case ADD_VM_STEPS.CREATION_TYPE:
        return this.validateCreationType(mainData);

      case ADD_VM_STEPS.NAME_AND_FOLDER:
        return this.validateNameAndFolder(mainData);

      case ADD_VM_STEPS.COMPUTE_RESOURCE:
        return this.validateComputeResource(mainData);

      case ADD_VM_STEPS.STORAGE:
        return this.validateStorage(mainData);

      case ADD_VM_STEPS.GUEST_OS:
        return this.validateOS(mainData);

      case ADD_VM_STEPS.HARDWARE:
        return this.validateHardware(mainData);
    }
  }

  convertToNameAndFolderTypeTreeNode(data: VcenterVMCreationMetaData[]) {
    let arr: UnityTreeViewNodeType[] = [];
    let hostNode = new UnityTreeViewNodeType();
    hostNode.name = data[0].host;
    hostNode.canSelect = false;
    hostNode.children = [];
    data.map(d => {
      let dcNode = new UnityTreeViewNodeType();
      dcNode.name = d.datacenter;
      dcNode.type = 'datacenter';
      dcNode.canSelect = true;
      hostNode.children.push(dcNode);
    })
    arr.push(hostNode);
    return arr;
  }

  convertClusterTypeToTreeNode(dc: string, clusters: VcenterVMCreateClusterItem[]): UnityTreeViewNodeType[] {
    let arr: UnityTreeViewNodeType[] = [];
    let dcNode = new UnityTreeViewNodeType();
    dcNode.name = dc;
    dcNode.type = 'datacenter';
    clusters.forEach(cluster => {
      let node = new UnityTreeViewNodeType();
      node.name = cluster.name;
      node.type = 'cluster';
      node.children = [];
      if (cluster.pool_data.length) {
        let pools: UnityTreeViewNodeType[] = [];
        cluster.pool_data.forEach(pool => {
          let cn = new UnityTreeViewNodeType();
          cn.name = pool;
          cn.type = 'resource_pool';
          cn.canSelect = true;
          pools.push(cn);
        });
        node.children = node.children.concat(pools);
      }
      if (cluster.hosts.length) {
        let hosts: UnityTreeViewNodeType[] = [];
        cluster.hosts.forEach(host => {
          let cn = new UnityTreeViewNodeType();
          cn.name = host;
          cn.type = 'host';
          cn.canSelect = true;
          hosts.push(cn);
        });
        node.children = node.children.concat(hosts);
      }
      node.canSelect = node.children.length ? true : false;
      arr.push(node);
    });
    dcNode.children = arr;
    return [dcNode];
  }

  convertToVMCreationData(mainData: AllStepsDataType) {
    let data: VcenterVMCreationData = new VcenterVMCreationData();
    data.vm_name = mainData[ADD_VM_STEPS.NAME_AND_FOLDER].name;
    data.datacenter = mainData[ADD_VM_STEPS.NAME_AND_FOLDER].destination;

    data.resource = new VcenterVMCreationResourceData();
    data.resource.name = mainData[ADD_VM_STEPS.COMPUTE_RESOURCE].computeResource;
    data.resource.type = mainData[ADD_VM_STEPS.COMPUTE_RESOURCE].computeResourceType;

    data.datastore = mainData[ADD_VM_STEPS.STORAGE].storage[0].name;

    data.guestOS = mainData[ADD_VM_STEPS.GUEST_OS].guestOSVersion;

    data.cpu = { value: Number(mainData[ADD_VM_STEPS.HARDWARE].cpu), hot_add_cpu: mainData[ADD_VM_STEPS.HARDWARE].cpuHotAdd };
    let memory = this.utilSvc.convertSizeToBytes(Number(mainData[ADD_VM_STEPS.HARDWARE].memory), mainData[ADD_VM_STEPS.HARDWARE].memoryUnit);
    data.memory = { value: memory, hot_add_memory: mainData[ADD_VM_STEPS.HARDWARE].memoryHotAdd }
    data.network = mainData[ADD_VM_STEPS.HARDWARE].network.map(nw => nw.network);
    data.iso = mainData[ADD_VM_STEPS.HARDWARE].iso;
    data.harddisk = mainData[ADD_VM_STEPS.HARDWARE].hardDisk.map(hd => {
      return {
        harddisk_size_bytes: this.utilSvc.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit),
        disk_provision_type: hd.diskProvision,
        controller: hd.controller
      }
    });
    data.boot_device = mainData[ADD_VM_STEPS.HARDWARE].boot_option;
    data.video_card = {
      ram_size_in_MB: mainData[ADD_VM_STEPS.HARDWARE].vcRamSize,
      num_display: mainData[ADD_VM_STEPS.HARDWARE].vcNumDisplay,
      settings: mainData[ADD_VM_STEPS.HARDWARE].vcSettings,
      value: 'Video Card',
      label: 'Video Card'
    }
    data.SCSI_controller = mainData[ADD_VM_STEPS.HARDWARE].scsiControllers;
    data.SATA_controller = mainData[ADD_VM_STEPS.HARDWARE].sataControllers;
    data.NVMe_controller = mainData[ADD_VM_STEPS.HARDWARE].nvmeControllers;
    mainData[ADD_VM_STEPS.HARDWARE].usbControllers.forEach((usb: string) => {
      if (usb == 'USB Controller') {
        data.USB_controller = [{
          'label': 'USB Controller',
          'value': 'USB Controller'
        }];
      } else {
        data.USB_xHCI_controller = [{
          'label': 'USB xHCI Controller',
          'value': 'USB xHCI Controller'
        }];
      }
    });
    return data;
  }

  getVMHardwareConfig(uuid: string, cloudName: string, name: string) {
    // return of(<any>{
    //   "state": "SUCCESS",
    //   "result": {
    //     "data": {
    //       "USB_xHCI_controller": {
    //         "value": "USB xHCI controller",
    //         "label": "USB xHCI controller "
    //       },
    //       "video_card": {
    //         "ram_size_in_MB": 8,
    //         "label": "Video card ",
    //         "num_display": 1,
    //         "value": "Video card",
    //         "settings": "custom"
    //       },
    //       "network": [],
    //       "memory": {
    //         "value": 8192,
    //         "unit": "MB",
    //         "hot_add_memory": false
    //       },
    //       "harddisk": [
    //         {
    //           "disk_mode": "persistent",
    //           "editable": true,
    //           "value": 150,
    //           "label": "Hard disk 1",
    //           "controller": "SCSI controller 0",
    //           "datastore": {
    //             "name": "PURE_DS",
    //             "summary": {
    //               "freeSpace": "216.1 GB",
    //               "capacity": "1.1 TB"
    //             }
    //           },
    //           "unit": "GB"
    //         },
    //         {
    //           "disk_mode": "persistent",
    //           "editable": true,
    //           "value": 500,
    //           "label": "Hard disk 2",
    //           "controller": "SATA controller 0",
    //           "datastore": {
    //             "name": "PURE_DS",
    //             "summary": {
    //               "freeSpace": "216.1 GB",
    //               "capacity": "1.1 TB"
    //             }
    //           },
    //           "unit": "GB"
    //         }
    //       ],
    //       "NVMe_controller": [],
    //       "controller_editable": false,
    //       "storage_controller_list": [
    //         "SCSI controller 0",
    //         "SATA controller 0"
    //       ],
    //       "SATA_controller": [
    //         {
    //           "value": "AHCI",
    //           "label": "SATA controller 0"
    //         }
    //       ],
    //       "cdrom": {
    //         "value": "[PURE_DS_TEMPLATES_ISO] en-us_windows_server_2019_updated_jul_2021_x64_dvd_01319f3c.iso",
    //         "label": "CD/DVD drive 1"
    //       },
    //       "datastore": [
    //         {
    //           "name": "PURE_DS",
    //           "summary": {
    //             "freeSpace": "216.1 GB",
    //             "capacity": "1.1 TB"
    //           }
    //         },
    //         {
    //           "name": "PURE_DS_TEMPLATES_ISO",
    //           "summary": {
    //             "freeSpace": "3.4 GB",
    //             "capacity": "19.8 GB"
    //           }
    //         }
    //       ],
    //       "cpu": {
    //         "hot_add_cpu": false,
    //         "value": 6
    //       },
    //       "SCSI_controller": [
    //         {
    //           "value": "VirtualLsiLogicSASController",
    //           "label": "SCSI controller 0"
    //         }
    //       ]
    //     }
    //   }
    // })
    return this.http.get<CeleryTask>(VCENTER_VM_HARDWARE_DETAILS(uuid, cloudName, name))
      .pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1))), take(1));
  }

  validateEditHardwareDisk(data: any, storageSummary: VcenterVMCreateSummary) {
    let isValid = true;
    if (!data.hardDisk) {
      data.hardDiskError = 'Disk capacity is required';
      isValid = false;
    } else {
      data.hardDiskError = '';
      isValid = true;
    }
    //This is to check if value is downsized
    let newSize = this.utilSvc.convertSizeToBytes(data.hardDisk, data.hardDiskUnit);
    let oldSize = this.utilSvc.convertSizeToBytes(data.value, data.unit);
    if (isValid) {
      if (newSize < oldSize) {
        data.hardDiskError = 'Disk capacity cannot be reduced';
        isValid = false;
      }
    }
    return isValid;
  }

  validateEditHardwareDisks(data: any, old: any, storageSummary: VcenterVMCreateSummary) {
    let isValid = false;
    let count = 0;
    let total = 0;
    old.forEach(hd => {
      this.validateEditHardwareDisk(hd, hd.datastore.summary) ? count++ : count;
      let newSize = this.utilSvc.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit);
      let oldSize = this.utilSvc.convertSizeToBytes(hd.value, hd.unit);
      if (newSize - oldSize > 0) {
        total += (newSize - oldSize);
      }
    });
    data.forEach(hd => {
      this.validateHardwareDisk(hd, storageSummary) ? count++ : count;
      total += this.utilSvc.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit);
    });
    if (count == (old.length + data.length)) {
      isValid = true;
    } else {
      isValid = false;
    }
    data.hardDiskError = '';
    old.hardDiskError = '';
    if (isValid && total > storageSummary.freespaceInBytes) {
      if (data.length) {
        data.hardDiskError = 'Total disk capacity cannot be greater than available in datastore';
      } else {
        old.hardDiskError = 'Total disk capacity cannot be greater than available in datastore';
      }
      isValid = false;
    }
    return isValid;
  }

  validateEditHardwareNetworks(data: any) {
    let isValid = false;
    let count = 0;
    data.forEach(nw => this.validateHardwareNetwork(nw) ? count++ : count);
    if (count == data.length) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid;
  }

  validateEditConfig(data: any) {
    let isValidMemory = this.validateHardwareMemory(data.memory);
    let isValidDisk = this.validateEditHardwareDisks(data.newHardDisks, data.hardDisks, data.dataStore.summary);
    let isValidNetwork = this.validateEditHardwareNetworks(data.newNetwork);
    let isValidISO = this.validateHardwareISO(data.cdrom);
    let isValidVideo = this.validateVideoCard(data.video_card);
    if (isValidMemory && isValidDisk && isValidNetwork && isValidVideo && isValidISO) {
      return true;
    }
    return false;
  }

  convertToVMEditConfigData(data: any) {
    let obj = {
      vm_name: data.name,
      old_network: data.network,
      new_network: data.newNetwork.map(nw => nw.network),
      remove_nic: (<any[]>data.network).filter(nw => nw.networkDeleted).map(nw => { return { label: nw.label } }),
      new_harddisk: data.newHardDisks.map(hd => {
        return {
          harddisk_size_bytes: this.utilSvc.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit),
          disk_provision_type: hd.diskProvision,
          controller: hd.controller
        }
      }),
      old_harddisk: data.hardDisks.map(hd => {
        return {
          value: hd.hardDisk,
          unit: hd.hardDiskUnit,
          datastore: hd.datastore,
          label: hd.label,
          editable: hd.editable,
          controller: hd.controller
        }
      }),
      remove_harddisk: (<any[]>data.hardDisks).filter(hd => hd.hardDiskDeleted).map(hd => { return { label: hd.label } }),
      memory: {
        value: this.utilSvc.convertSizeToBytes(Number(data.memory.memory), data.memory.memoryUnit),
        hot_add_memory: data.memory.memoryHotAdd
      },
      datastore: data.dataStore.name,
      cpu: {
        value: Number(data.cpu),
        hot_add_cpu: data.cpuHotAdd
      },
      video_card: {
        ram_size_in_MB: Number(data.video_card.vcRamSize),
        num_display: Number(data.video_card.vcNumDisplay),
        settings: data.video_card.vcSettings,
        value: data.video_card.value,
        label: data.video_card.label
      },
      storage_controller_list: data.storageControllers,
      NVMe_controller: [...data.newNVMe_controller],
      SATA_controller: [...data.newSATA_controller],
      old_scsi_controller: data.oldSCSI_controller,
      new_scsi_controller: data.newSCSI_controller
    };
    // if (data.USB_xHCI_controller) {
    //   obj['USB_xHCI_controller'] = data.USB_xHCI_controller;
    // }
    // if (data.USB_controller) {
    //   obj['USB_controller'] = data.USB_controller;
    // }
    data.newUSBController.forEach((usb: string) => {
      if (usb == 'USB controller') {
        obj['USB_controller'] = {
          'label': 'USB controller',
          'value': 'USB controller'
        };
      } else {
        obj['USB_xHCI_controller'] = {
          'label': 'USB xHCI controller',
          'value': 'USB xHCI controller'
        };
      }
    });

    if (!(data.cdrom.selectedValue == '' || data.cdrom.selectedValue == data.cdrom.value)) {
      obj['cdrom'] = {
        label: data.cdrom.label,
        existing_iso: data.cdrom.value ? data.cdrom.value : null,
        iso: data.cdrom.iso,
        boot_option: data.cdrom.boot_option
      }
    }

    return obj;
  }

  submitEditConfig(pcId: string, cloudName: string, data: any) {
    return this.http.post<CeleryTask>(UPDATE_VCENTER_VM(pcId, cloudName), data);
  }
}

export class VcenterVMCreationData {
  vm_name: string;
  datacenter: string;
  resource: VcenterVMCreationResourceData;
  datastore: string;
  cpu: {
    hot_add_cpu: boolean;
    value: number;
  }
  memory: {
    hot_add_memory: boolean;
    value: number;
  };
  network: string[];
  iso: string;
  harddisk: { harddisk_size_bytes: string, disk_provision_type: string }[];
  boot_device: string;
  guestOS: string;
  video_card: {
    ram_size_in_MB: number;
    label: string;
    num_display: number;
    value: string;
    settings: string;
  }
  SCSI_controller: { label: string, value: string }[];
  SATA_controller: { label: string, value: string }[];
  NVMe_controller: { label: string, value: string }[];
  USB_controller: { label: string, value: string }[];
  USB_xHCI_controller: { label: string, value: string }[];
  constructor() { }
}

export class VcenterVMCreationResourceData {
  type: string = null;
  name: string = null;
  constructor() { }
}

export const ADD_VM_WIZARD_STEPS: AddVMWizardStepType[] = [
  {
    icon: 'fas fa-link',
    stepName: ADD_VM_STEPS.CREATION_TYPE,
    active: false,
    visited: false
  },
  {
    icon: 'fas fa-poll',
    stepName: ADD_VM_STEPS.NAME_AND_FOLDER,
    active: false,
    visited: false
  },
  {
    icon: 'fa fa-database',
    stepName: ADD_VM_STEPS.COMPUTE_RESOURCE,
    active: false,
    visited: false
  },
  {
    icon: `fa ${FaIconMapping.STORAGE_DEVICE}`,
    stepName: ADD_VM_STEPS.STORAGE,
    active: false,
    visited: false
  },
  {
    icon: `fa ${FaIconMapping.BARE_METAL_SERVER}`,
    stepName: ADD_VM_STEPS.GUEST_OS,
    active: false,
    visited: false
  },
  {
    icon: `fa ${FaIconMapping.SWITCH}`,
    stepName: ADD_VM_STEPS.HARDWARE,
    active: false,
    visited: false
  },
  {
    icon: 'fa fa-clipboard',
    stepName: ADD_VM_STEPS.SUMMARY,
    active: false,
    visited: false
  }
]

export class UnityTreeViewNodeType {
  name: string;
  type?: string;
  children?: UnityTreeViewNodeType[];
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
