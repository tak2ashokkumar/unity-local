import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_WINDOWS_RDP_URL_FOR_ZTC_COLLECTOR, MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_LIST_BY_PLATFORM, HYPERV_VM_HARDWARE_DETAILS, UPDATE_HYPERV_VM, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';

@Injectable()
export class VmsListHypervService {
  private editVMConfigAnnouncedSource = new Subject<{ uuid: string, name: string }>();
  editVMConfigAnnounced$ = this.editVMConfigAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private builder: FormBuilder,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  editVM(uuid: string, name: string): void {
    this.editVMConfigAnnouncedSource.next({ uuid: uuid, name: name });
  }

  getVms(platformType: PlatFormMapping, criteria: SearchCriteria): Observable<PaginatedResult<HypervVMType>> {
    return this.tableService.getData<PaginatedResult<HypervVMType>>(GET_VM_LIST_BY_PLATFORM(platformType), criteria);
  }

  getVMHardwareConfig(pcId: string, name: string): Observable<HypervCeleryTask> {
    return this.http.get<HypervCeleryTask>(HYPERV_VM_HARDWARE_DETAILS(pcId, name));
  }

  submitEditConfig(pcId: string, data: HypervVMUpdatePayload): Observable<HypervCeleryTask> {
    return this.http.post<HypervCeleryTask>(UPDATE_HYPERV_VM(pcId), data);
  }

  getTaskId(task: HypervCeleryTask): string {
    return task.task_id || task.task || '';
  }

  createEditConfigData(data: HypervVMHardwareConfig): HypervVMHardwareEditData {
    const cpu = data && data.cpu ? data.cpu : <HypervVMCpu>{};
    const memoryData = data && data.memory ? data.memory : <HypervVMMemory>{};
    const hardDisks = data && Array.isArray(data.disks) ? data.disks : [];
    const network = data && Array.isArray(data.network_adapters) ? data.network_adapters : [];
    const dvdDrives = data && Array.isArray(data.dvd_drives) ? data.dvd_drives : [];
    const scsiControllers = data && Array.isArray(data.scsi_controllers) ? data.scsi_controllers : [];
    const defaultScsiControllers: HypervVMScsiController[] = [{
      label: 'SCSI controller 0',
      controller_number: 0,
      value: 'ParaVirtualSCSIController',
      editable: true
    }];
    const defaultDvdDrives: HypervVMDvdDrive[] = [{
      label: 'CD/DVD drive 1',
      path: '',
      controller_number: 0,
      controller_location: 0,
      editable: true,
      synthetic: true
    }];
    const defaultNetwork: HypervVMNetwork[] = [{
      name: 'Network adapter 1',
      switch_name: '',
      mac_address: '',
      ip_addresses: []
    }];
    const switches = data && Array.isArray(data.switches) ? data.switches : network.map((nw: HypervVMNetwork) => nw.switch_name).filter(Boolean);
    const cpuRequired = cpu.value !== null && cpu.value !== undefined && cpu.value !== <any>'';
    const memoryRequired = memoryData.value !== null && memoryData.value !== undefined && memoryData.value !== <any>'';
    const memory = this.convertBytesToDisplaySize(memoryData.value);
    return {
      vmName: data ? data.vm_name : '',
      cpu: cpu.value || null,
      cpuRequired: cpuRequired,
      cpuError: '',
      cpuHotAdd: false,
      cpuExpand: true,
      memory: {
        memory: memory.value,
        memoryRequired: memoryRequired,
        memoryUnit: memory.unit,
        memoryError: '',
        memoryHotAdd: false,
        memoryExpand: true
      },
      hardDisks: hardDisks.map((hd: HypervVMHardDisk) => {
        const disk = this.convertBytesToDisplaySize(hd.value);
        return {
          label: hd.label || 'Hard Disk',
          path: hd.path || '',
          controllerType: hd.controller_type || '',
          controllerNumber: hd.controller_number,
          controllerLocation: hd.controller_location === null || hd.controller_location === undefined ? 0 : hd.controller_location,
          hardDisk: disk.value,
          hardDiskUnit: disk.unit,
          value: hd.value || 0,
          unit: hd.unit || 'bytes',
          editable: hd.editable !== false,
          isNew: false,
          hardDiskDeleted: false,
          hardDiskExpand: true,
          hardDiskError: ''
        };
      }),
      newHardDisks: [],
      network: (network.length ? network : defaultNetwork).map((nw: HypervVMNetwork) => ({
        name: nw.name || '',
        switchName: nw.switch_name || '',
        macAddress: nw.mac_address || '',
        ipAddresses: nw.ip_addresses || [],
        isNew: false,
        networkDeleted: false,
        networkError: '',
        nameError: ''
      })),
      newNetwork: [],
      dvdDrives: (dvdDrives.length ? dvdDrives : defaultDvdDrives).map((dvd: HypervVMDvdDrive) => ({
        label: dvd.label || 'CD/DVD drive',
        path: dvd.path || '',
        controllerNumber: dvd.controller_number,
        controllerLocation: dvd.controller_location,
        synthetic: !!dvd.synthetic,
        isNew: false,
        dvdDeleted: false,
        dvdError: ''
      })),
      newDvdDrives: [],
      scsiControllers: (scsiControllers.length ? scsiControllers : defaultScsiControllers).map((controller: HypervVMScsiController) => ({
        label: controller.label || 'SCSI controller',
        controllerNumber: controller.controller_number,
        value: controller.value || 'ParaVirtualSCSIController',
        isNew: false,
        controllerDeleted: false
      })),
      newScsiControllers: [],
      switches: switches,
      editable: data ? data.controller_editable !== false : true
    };
  }

  addHardDiskDefaults(): HypervVMHardDiskEditData {
    return {
      label: 'New Hard Disk',
      path: '',
      controllerType: '',
      controllerNumber: null,
      controllerLocation: null,
      hardDisk: 1,
      hardDiskUnit: 'GB',
      value: 0,
      unit: 'bytes',
      editable: true,
      isNew: true,
      hardDiskDeleted: false,
      hardDiskExpand: false,
      hardDiskError: ''
    };
  }

  addNetworkDefaults(): HypervVMNetworkEditData {
    return {
      name: 'Network Adapter',
      switchName: '',
      macAddress: '',
      ipAddresses: [],
      isNew: true,
      networkDeleted: false,
      networkError: '',
      nameError: ''
    };
  }

  addDvdDriveDefaults(): HypervVMDvdDriveEditData {
    return {
      label: 'CD/DVD drive 1',
      path: '',
      controllerNumber: null,
      controllerLocation: null,
      isNew: true,
      dvdDeleted: false,
      dvdError: ''
    };
  }

  addScsiControllerDefaults(): HypervVMScsiControllerEditData {
    return {
      label: 'SCSI controller',
      controllerNumber: null,
      value: 'ParaVirtualSCSIController',
      isNew: true,
      controllerDeleted: false
    };
  }

  validateEditConfig(data: HypervVMHardwareEditData): boolean {
    const isCpuValid = this.validateHardwareCpu(data);
    const isMemoryValid = this.validateHardwareMemory(data.memory);
    const isHardDiskValid = data.hardDisks
      .concat(data.newHardDisks)
      .filter(hd => !hd.hardDiskDeleted)
      .map(hd => this.validateHardwareDisk(hd))
      .every(Boolean);
    const isNetworkValid = data.network
      .concat(data.newNetwork)
      .filter(nw => !nw.networkDeleted)
      .map(nw => this.validateHardwareNetwork(nw))
      .every(Boolean);
    const isDvdValid = data.dvdDrives
      .concat(data.newDvdDrives)
      .filter(dvd => !dvd.dvdDeleted)
      .map(dvd => this.validateDvdDrive(dvd))
      .every(Boolean);
    return isCpuValid && isMemoryValid && isHardDiskValid && isNetworkValid && isDvdValid;
  }

  validateHardwareCpu(data: HypervVMHardwareEditData): boolean {
    if (data.cpu === null || data.cpu === undefined || data.cpu === <any>'') {
      data.cpuError = data.cpuRequired ? 'CPU is required' : '';
      return !data.cpuRequired;
    }
    data.cpuError = '';
    return true;
  }

  validateHardwareMemory(data: HypervVMMemoryEditData): boolean {
    if (!data.memory) {
      data.memoryError = data.memoryRequired ? 'Memory is required' : '';
      return !data.memoryRequired;
    }
    if (Number(data.memory) < 4) {
      data.memoryError = 'Minimum memory is 4 MB';
      return false;
    }
    data.memoryError = '';
    return true;
  }

  validateHardwareDisk(data: HypervVMHardDiskEditData): boolean {
    let isValid = true;
    const hardDiskSize = Number(this.utilService.convertSizeToBytes(data.hardDisk, data.hardDiskUnit));
    if (!data.isNew && !data.hardDisk) {
      data.hardDiskError = '';
      return true;
    }
    if (!data.hardDisk) {
      data.hardDiskError = 'Disk capacity is required';
      isValid = false;
    } else if (data.value && hardDiskSize < data.value) {
      data.hardDiskError = 'Disk capacity cannot be reduced';
      isValid = false;
    } else {
      data.hardDiskError = '';
    }
    return isValid;
  }

  validateHardwareNetwork(data: HypervVMNetworkEditData): boolean {
    let isValid = true;
    if (!data.isNew && !data.name && !data.switchName) {
      data.nameError = '';
      data.networkError = '';
      return true;
    }
    if (!data.isNew && data.name && !data.switchName) {
      data.nameError = '';
      data.networkError = '';
      return true;
    }
    if (!data.name) {
      data.nameError = 'Name is required';
      isValid = false;
    } else {
      data.nameError = '';
    }
    if (!data.switchName) {
      data.networkError = 'Switch name is required';
      isValid = false;
    } else {
      data.networkError = '';
    }
    return isValid;
  }

  validateDvdDrive(data: HypervVMDvdDriveEditData): boolean {
    data.dvdError = '';
    return true;
  }

  convertToVMEditConfigData(data: HypervVMHardwareEditData): HypervVMUpdatePayload {
    const hardDisksUpdate = data.hardDisks
      .filter(hd => !hd.hardDiskDeleted && !!hd.hardDisk)
      .map(hd => this.createHardDiskUpdatePayload(hd));
    const hardDisksCreate = data.newHardDisks
      .filter(hd => !hd.hardDiskDeleted && !!hd.hardDisk)
      .map(hd => ({
        path: hd.path,
        size: Number(this.utilService.convertSizeToBytes(hd.hardDisk, hd.hardDiskUnit))
      }));
    const hardDisksRemove = data.hardDisks
      .filter(hd => hd.hardDiskDeleted && (hd.path || hd.label))
      .map(hd => this.createHardDiskRemovePayload(hd));
    const networkInterfacesUpdate = data.network
      .filter(nw => !nw.networkDeleted && !!nw.name && !!nw.switchName)
      .map(nw => ({
        name: nw.name,
        switch_name: nw.switchName
      }));
    const networkInterfacesCreate = data.newNetwork
      .filter(nw => !nw.networkDeleted && !!nw.name && !!nw.switchName)
      .map(nw => ({
        name: nw.name,
        switch_name: nw.switchName
      }));
    const networkInterfacesRemove = data.network
      .filter(nw => nw.networkDeleted && nw.name)
      .map(nw => ({ name: nw.name }));
    const dvdDrivesUpdate = data.dvdDrives
      .filter(dvd => !dvd.synthetic && !dvd.dvdDeleted)
      .map(dvd => ({
        label: dvd.label,
        path: dvd.path,
        controller_number: dvd.controllerNumber,
        controller_location: dvd.controllerLocation
      }));
    const dvdDrivesCreate = data.newDvdDrives
      .filter(dvd => !dvd.dvdDeleted)
      .map(dvd => ({
        path: dvd.path
      }));
    const dvdDrivesRemove = data.dvdDrives
      .filter(dvd => !dvd.synthetic && dvd.dvdDeleted)
      .map(dvd => ({
        label: dvd.label,
        path: dvd.path,
        controller_number: dvd.controllerNumber,
        controller_location: dvd.controllerLocation
      }));
    const scsiControllersCreate = data.newScsiControllers
      .filter(controller => !controller.controllerDeleted)
      .map(controller => ({ label: controller.label }));
    const scsiControllersRemove = data.scsiControllers
      .filter(controller => controller.controllerDeleted && controller.controllerNumber !== null && controller.controllerNumber !== undefined)
      .map(controller => ({
        label: controller.label,
        controller_number: controller.controllerNumber
      }));
    const payload: HypervVMUpdatePayload = {
      vm_name: data.vmName,
      hard_disks: {
        update: hardDisksUpdate,
        create: hardDisksCreate,
        remove: hardDisksRemove
      },
      network_interfaces: {
        update: networkInterfacesUpdate,
        create: networkInterfacesCreate,
        remove: networkInterfacesRemove
      },
      dvd_drives: {
        update: dvdDrivesUpdate,
        create: dvdDrivesCreate,
        remove: dvdDrivesRemove
      },
      scsi_controllers: {
        update: [],
        create: scsiControllersCreate,
        remove: scsiControllersRemove
      }
    };
    if (data.cpu !== null && data.cpu !== undefined && data.cpu !== <any>'') {
      payload.cpu = {
        value: Number(data.cpu)
      };
    }
    if (data.memory.memory) {
      payload.memory = {
        value: Number(this.utilService.convertSizeToBytes(data.memory.memory, data.memory.memoryUnit))
      };
    }
    return payload;
  }

  convertVMtoViewdata(vm: HypervVMType) {
    let a = new HypervVMViewData();
    a.uuid = vm.uuid;
    a.vmId = vm.vm_id;
    a.name = vm.vm_name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
    a.osName = vm.os ? vm.os : 'N/A';
    a.ssrOS = vm.ssr_os;
    // a.powerStatus = vm.status == 'Running' ? 'Up' : 'Down';
    a.powerStatus = vm.status;
    a.powerOnInProgress = !!vm.actions_in_progress?.power_on;
    a.powerOffInProgress = !!vm.actions_in_progress?.power_off;
    a.cpucores = vm.cpu;
    a.memory = vm.memory;
    a.storage = vm.storage;
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;
    a.collectorUuid = vm.collector?.uuid;
    a.isCollectorZtc = vm.collector?.is_ztc;

    if (this.user.isManagementEnabled) {
      const isWindows: boolean = vm.os ? (vm.os.includes('Microsoft') || vm.os.includes('Windows', 0) || vm.ssr_os == 'Windows') : false;
      const powerOn: boolean = vm.status == 'Running';
      a.isSameTabEnabled = ((vm.management_ip ? true : false) && powerOn && !isWindows);
      if (!vm.management_ip) {
        a.sameTabTootipMessage = 'Management IP not Configured';
      } else if (!powerOn) {
        a.sameTabTootipMessage = 'VM is Down';
      } else if (isWindows) {
        a.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
      } else {
        a.sameTabTootipMessage = 'Open in same tab';
      }

      a.isNewTabEnabled = ((vm.management_ip ? true : false) && powerOn);
      if (!vm.management_ip) {
        a.newTabToolipMessage = 'Management IP not Configured';
      } else if (!powerOn) {
        a.newTabToolipMessage = 'VM is Down';
      } else if (isWindows) {
        a.newTabToolipMessage = 'Open In New Tab';
        if (vm.collector?.is_ztc) {
          a.newTabConsoleAccessUrl = `${window.location.origin}${GET_WINDOWS_RDP_URL_FOR_ZTC_COLLECTOR(a.collectorUuid, a.managementIp)}`;
        } else {
          a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.managementIp) : WINDOWS_CONSOLE_CLIENT(a.managementIp);
        }
      } else {
        a.newTabToolipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
      }
    } else {
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }

    if (!this.user.isManagementEnabled) {
      a.fileManagerEnabled = false;
      a.fileManagerMsg = MANAGEMENT_NOT_ENABLED_MESSAGE();
    } else if (!vm.management_ip) {
      a.fileManagerEnabled = false;
      a.fileManagerMsg = 'Management IP not Configured';
    } else if (vm.status != 'Running') {
      a.fileManagerEnabled = false;
      a.fileManagerMsg = 'VM is Down';
    } else if (!a.collectorUuid) {
      a.fileManagerEnabled = false;
      a.fileManagerMsg = 'Collector not Configured';
    } else {
      a.fileManagerEnabled = true;
      a.fileManagerMsg = 'File Manager';
    }
    return a;
  }

  converToViewData(vms: HypervVMType[]): HypervVMViewData[] {
    let viewData: HypervVMViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  buildPowerAuthForm(view: HypervVMViewData): FormGroup {
    return this.builder.group({
      uuid: [view.uuid],
      cloud_uuid: [view.cloudId],
      vm_id: [view.vmId],
      username: ['', [Validators.required, NoWhitespaceValidator]],
      password: ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  resetPowerAuthFormErrors(): HypervVMPowerAuthFormErrors {
    return {
      username: '',
      password: '',
      nonFieldErr: ''
    };
  }

  readonly powerAuthValidationMessages: Record<string, Record<string, string>> = {
    username: {
      required: 'Username is required'
    },
    password: {
      required: 'Password is required'
    }
  };

  toggleHypervVMPower(data: HypervVMPowerTogglePayload, currentPowerStatus: boolean): Observable<CeleryTask> {
    const endpoint = currentPowerStatus ? 'customer/hyperv/vms/power_off/' : 'customer/hyperv/vms/power_on/';
    return this.http.post<CeleryTask>(endpoint, data);
  }

  getConsoleAccessInput(deviceMapping: DeviceMapping, view: HypervVMViewData): ConsoleAccessInput {
    return { label: deviceMapping, deviceType: deviceMapping, deviceId: view.uuid, newTab: false, deviceName: view.name };
  }

  getDeviceData(device: HypervVMViewData) {
    if (!device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      // device.popOverDetails.lastreboot = '0';
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPER_V, device.uuid) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPER_V, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'Hyperv VM Statistics';
          }
          return device;
        })
      );
  }

  private convertBytesToDisplaySize(bytes: number): { value: number | null, unit: 'MB' | 'GB' | 'TB' } {
    if (!bytes) {
      return { value: null, unit: 'MB' };
    }
    if (bytes % Math.pow(1024, 4) === 0) {
      return { value: bytes / Math.pow(1024, 4), unit: 'TB' };
    }
    if (bytes % Math.pow(1024, 3) === 0) {
      return { value: bytes / Math.pow(1024, 3), unit: 'GB' };
    }
    return { value: bytes / Math.pow(1024, 2), unit: 'MB' };
  }

  private createHardDiskUpdatePayload(data: HypervVMHardDiskEditData): HypervVMUpdateHardDisk {
    const payload: HypervVMUpdateHardDisk = {
      size: Number(this.utilService.convertSizeToBytes(data.hardDisk, data.hardDiskUnit))
    };
    this.addHardDiskIdentityPayload(payload, data);
    return payload;
  }

  private createHardDiskRemovePayload(data: HypervVMHardDiskEditData): HypervVMRemoveHardDisk {
    const payload: HypervVMRemoveHardDisk = {};
    this.addHardDiskIdentityPayload(payload, data);
    return payload;
  }

  private addHardDiskIdentityPayload(payload: HypervVMUpdateHardDisk | HypervVMRemoveHardDisk, data: HypervVMHardDiskEditData): void {
    if (data.path) {
      payload.path = data.path;
    }
    if (data.label) {
      payload.label = data.label;
    }
    if (data.controllerType) {
      payload.controller_type = data.controllerType;
    }
    if (data.controllerNumber !== null && data.controllerNumber !== undefined) {
      payload.controller_number = data.controllerNumber;
    }
    if (data.controllerLocation !== null && data.controllerLocation !== undefined) {
      payload.controller_location = data.controllerLocation;
    }
  }
}

export interface HypervCeleryTask {
  task?: string;
  task_id?: string;
}

export interface HypervVMHardwareConfig {
  vm_name: string;
  vm_id: string;
  status: string;
  cpu: HypervVMCpu;
  memory: HypervVMMemory;
  disks: HypervVMHardDisk[];
  network_adapters: HypervVMNetwork[];
  dvd_drives: HypervVMDvdDrive[];
  scsi_controllers: HypervVMScsiController[];
  switches: string[];
  controller_editable: boolean;
}

export interface HypervVMCpu {
  value: number;
  hot_add_cpu: boolean;
}

export interface HypervVMMemory {
  value: number;
  unit: string;
  hot_add_memory: boolean;
}

export interface HypervVMHardDisk {
  label: string;
  path: string;
  controller_type?: string;
  controller_number?: number;
  controller_location?: number;
  value: number;
  unit: string;
  editable: boolean;
}

export interface HypervVMNetwork {
  name: string;
  switch_name: string;
  mac_address: string;
  ip_addresses: string[];
}

export interface HypervVMDvdDrive {
  label: string;
  path: string;
  controller_number: number;
  controller_location: number;
  editable: boolean;
  synthetic?: boolean;
}

export interface HypervVMScsiController {
  label: string;
  controller_number: number;
  value?: string;
  editable: boolean;
}

export interface HypervVMHardwareEditData {
  vmName: string;
  cpu: number | null;
  cpuRequired: boolean;
  cpuError: string;
  cpuHotAdd: boolean;
  cpuExpand: boolean;
  memory: HypervVMMemoryEditData;
  hardDisks: HypervVMHardDiskEditData[];
  newHardDisks: HypervVMHardDiskEditData[];
  network: HypervVMNetworkEditData[];
  newNetwork: HypervVMNetworkEditData[];
  dvdDrives: HypervVMDvdDriveEditData[];
  newDvdDrives: HypervVMDvdDriveEditData[];
  scsiControllers: HypervVMScsiControllerEditData[];
  newScsiControllers: HypervVMScsiControllerEditData[];
  switches: string[];
  editable: boolean;
}

export interface HypervVMMemoryEditData {
  memory: number | null;
  memoryRequired: boolean;
  memoryUnit: 'MB' | 'GB' | 'TB';
  memoryError: string;
  memoryHotAdd: boolean;
  memoryExpand: boolean;
}

export interface HypervVMHardDiskEditData {
  label: string;
  path: string;
  controllerType: string;
  controllerNumber: number | null;
  controllerLocation: number | null;
  hardDisk: number | null;
  hardDiskUnit: 'MB' | 'GB' | 'TB';
  value: number;
  unit: string;
  editable: boolean;
  isNew: boolean;
  hardDiskDeleted: boolean;
  hardDiskExpand: boolean;
  hardDiskError: string;
}

export interface HypervVMNetworkEditData {
  name: string;
  switchName: string;
  macAddress: string;
  ipAddresses: string[];
  isNew: boolean;
  networkDeleted: boolean;
  networkError: string;
  nameError: string;
}

export interface HypervVMDvdDriveEditData {
  label: string;
  path: string;
  controllerNumber: number | null;
  controllerLocation: number | null;
  synthetic?: boolean;
  isNew: boolean;
  dvdDeleted: boolean;
  dvdError: string;
}

export interface HypervVMScsiControllerEditData {
  label: string;
  controllerNumber: number | null;
  value: string;
  isNew: boolean;
  controllerDeleted: boolean;
}

export interface HypervVMUpdatePayload {
  vm_name: string;
  cpu?: {
    value: number;
  };
  memory?: {
    value: number;
  };
  hard_disks: HypervVMUpdateDeviceActions<HypervVMUpdateHardDisk, HypervVMRemoveHardDisk>;
  network_interfaces: HypervVMUpdateDeviceActions<HypervVMUpdateNetworkInterface, HypervVMRemoveNetworkInterface>;
  dvd_drives: HypervVMUpdateDeviceActions<HypervVMUpdateDvdDrive, HypervVMRemoveDvdDrive>;
  scsi_controllers: HypervVMUpdateDeviceActions<HypervVMUpdateScsiController, HypervVMRemoveScsiController>;
}

export interface HypervVMUpdateDeviceActions<TUpdate, TRemove> {
  update: TUpdate[];
  create: TUpdate[];
  remove: TRemove[];
}

export interface HypervVMUpdateHardDisk {
  path?: string;
  label?: string;
  controller_type?: string;
  controller_number?: number | null;
  controller_location?: number | null;
  size: number;
}

export interface HypervVMRemoveHardDisk {
  path?: string;
  label?: string;
  controller_type?: string;
  controller_number?: number | null;
  controller_location?: number | null;
}

export interface HypervVMUpdateNetworkInterface {
  name: string;
  switch_name: string;
}

export interface HypervVMRemoveNetworkInterface {
  name: string;
}

export interface HypervVMUpdateDvdDrive {
  label?: string;
  path?: string;
  controller_number?: number | null;
  controller_location?: number | null;
}

export interface HypervVMRemoveDvdDrive {
  label?: string;
  path?: string;
  controller_number?: number | null;
  controller_location?: number | null;
}

export interface HypervVMUpdateScsiController {
  label?: string;
}

export interface HypervVMRemoveScsiController {
  label?: string;
  controller_number?: number | null;
}

export class HypervVMViewData {
  private static readonly POWER_ON_STATES = ['poweredon', 'active', 'running', 'vmrunning', 'run', 'on', 'up'];
  private static readonly POWER_OFF_STATES = ['poweredoff', 'shutoff', 'stopped', 'vmstopped', 'terminated', 'off', 'down'];

  constructor() { }
  uuid: string;
  vmId: string;
  name: string;
  cloudId: string;
  cloud: string;
  managementIp: string;
  osName: string;
  ssrOS: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  cpucores: number;
  memory: string;
  storage: string;
  type: string;
  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  fileManagerEnabled: boolean;
  fileManagerMsg: string;
  statsTooltipMessage: string;
  tags: string[];
  monitoring: DeviceMonitoringType;
  collectorUuid: string;
  isCollectorZtc: boolean;
  private _powerStatus: string = '';
  private _powerOnInProgress: boolean = false;
  private _powerOffInProgress: boolean = false;

  set powerStatus(status: string) {
    this._powerStatus = status;
  }

  get powerStatus(): string {
    if (this.powerInProgress) {
      return this._powerOffInProgress ? 'Stopping' : 'Starting';
    }
    if (this.powerStatusOn) {
      return 'Up';
    }
    if (this.powerStatusOff) {
      return 'Down';
    }
    return 'Unknown';
  }

  set powerOnInProgress(powerOnInProgress: boolean) {
    this._powerOnInProgress = powerOnInProgress;
  }

  set powerOffInProgress(powerOffInProgress: boolean) {
    this._powerOffInProgress = powerOffInProgress;
  }

  get powerStatusOn(): boolean {
    return HypervVMViewData.POWER_ON_STATES.includes(this.normalizedPowerStatus);
  }

  get powerIcon(): string {
    return this.powerInProgress ? 'fa fa-spinner fa-spin' : 'fa-power-off';
  }

  get powerIconEnabled(): boolean {
    return !this.powerInProgress;
  }

  get powerIconMsg(): string {
    if (this.powerInProgress) {
      return this._powerOffInProgress ? 'Stopping' : 'Starting';
    }
    if (!this.powerStatusKnown) {
      return 'Power status unavailable';
    }
    return this.powerStatusOn ? 'Power Off' : 'Power On';
  }

  setPowerInProgress(): void {
    if (this.powerStatusOn) {
      this._powerOffInProgress = true;
      this._powerOnInProgress = false;
    } else {
      this._powerOnInProgress = true;
      this._powerOffInProgress = false;
    }
    this._powerStatus = '';
  }

  clearPowerInProgress(): void {
    this._powerOnInProgress = false;
    this._powerOffInProgress = false;
  }

  private get powerStatusOff(): boolean {
    return HypervVMViewData.POWER_OFF_STATES.includes(this.normalizedPowerStatus);
  }

  private get powerStatusKnown(): boolean {
    return this.powerStatusOn || this.powerStatusOff;
  }

  private get powerInProgress(): boolean {
    return this._powerOnInProgress || this._powerOffInProgress;
  }

  private get normalizedPowerStatus(): string {
    return this._powerStatus ? this._powerStatus.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  }
}


export interface HypervVMType {
  id: number;
  uuid: string;
  cloud: Cloud;
  vm_id: string;
  vm_name: string;
  name: string;
  node_name: string;
  os_type: string;
  os: string;
  ssr_os: string;
  cpu: number;
  memory: null;
  storage: null;
  status: 'Off' | 'Running';
  cluster: number;
  management_ip: null;
  actions_in_progress: ActionsInProgress;
  tags: string[];
  monitoring: DeviceMonitoringType;
  collector: CollectorType;
}

export interface HypervVMPowerTogglePayload {
  uuid: string;
  cloud_uuid: string;
  vm_id: string;
  username: string;
  password: string;
}

export interface HypervVMPowerAuthFormErrors {
  [key: string]: string;
  username: string;
  password: string;
  nonFieldErr: string;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
interface ActionsInProgress {
  power_on: boolean;
  clone: boolean;
  power_off: boolean;
  reboot: boolean;
  convert_to_template: boolean;
  delete: boolean;
}
