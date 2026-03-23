import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { FEATURE_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import { CABINET_DEVIECS_BY_CABINET_ID, CHECK_PDU_AUTHENTICATION, DEVICE_DATA_BY_DEVICE_TYPE, PDU_SOCKET_MAPPING, PUDS_BY_DATACENTER_ID, RECYCLE_PDU, UPDATE_PDU_MAPPING, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../shared/devices-popover/device-popover-data';
import { PDU } from '../entities/pdus.type';

@Injectable()
export class DatacenterPdusService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getPdus(dcId: string, criteria: SearchCriteria): Observable<PaginatedResult<PDU>> {
    return this.tableService.getData<PaginatedResult<PDU>>(PUDS_BY_DATACENTER_ID(dcId), criteria);
  }

  convertToViewData(devices: PDU[]): PDUViewData[] {
    let viewData: PDUViewData[] = [];
    devices.map(d => {
      let a = new PDUViewData();
      a.pduId = d.uuid;
      a.id = d.id + '';
      a.name = d.name;
      a.ip = d.management_ip ? d.management_ip : 'N/A';
      a.model = d.model;
      a.cabinet = d.cabinet.name;
      a.cabinetId = d.cabinet.uuid;
      a.serialNumber = d.serial_number;
      a.usableAmps = d.max_amps * 0.8;
      a.voltage = d.voltage;
      a.outletCount = d.outlet_count;
      a.socketsCount = d.sockets;
      a.pduType = d.pdu_type;
      a.size = d.size;
      a.monitoring = d.monitoring;
      a.tags = d.tags.filter(tg => tg);
      if (d.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(d.status);
      }

      if (this.user.isManagementEnabled) {
        a.recycleIconEnabled = d.ip_address ? true : false;
        a.recycleIconTooltip = d.ip_address ? 'Recycle' : FEATURE_NOT_ENABLED_MESSAGE();
      } else {
        a.recycleIconEnabled = false;
        a.recycleIconTooltip = FEATURE_NOT_ENABLED_MESSAGE();
      }
      // a.recycleIconEnabled = pdu.model.startsWith('AP');
      // a.recycleIconTooltip = pdu.model.startsWith('AP') ? 'Recycle' : 'Power cycle option is not supported by this model';
      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: PDUViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU, device.pduId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU, device.pduId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'PDU Statistics';
          }
          return device;
        })
      );
  }

  createDevice<T extends DeviceItem>(device: T, deviceType: string, deviceDisplayType: string) {
    let d: Device = new Device();
    d.id = device.id;
    d.name = device.name;
    d.uuid = device.uuid;
    d.device_type = deviceType;
    d.uniqueName = d.device_type + ' - ' + d.name;
    d.displayName = deviceDisplayType + ' - ' + d.name;
    return d;
  }

  getCabinetDevices(cabinetId: string): Observable<Device[]> {
    let devices: Device[] = [];
    return this.http.get<CabinetDevice>(CABINET_DEVIECS_BY_CABINET_ID(cabinetId)).pipe(map((res: CabinetDevice) => {
      res.switches.map(sw => devices.push(this.createDevice(sw, 'switch', 'switch')));
      res.firewalls.map(fw => devices.push(this.createDevice(fw, 'firewall', 'firewall')));
      res.load_balancers.map(lb => devices.push(this.createDevice(lb, 'loadbalancer', 'loadbalancer')));
      res.servers.map(sv => devices.push(this.createDevice(sv, 'server', 'server')));
      res.storage_devices.map(sd => devices.push(this.createDevice(sd, 'storagedevice', 'storage')));
      res.mac_devices.map(mm => devices.push(this.createDevice(mm, 'macdevice', 'macmini')));
      res.custom_devices.map(od => devices.push(this.createDevice(od, 'otherdevice', 'otherdevice')));
      let d: Device = new Device();
      d.displayName = 'Empty Slot';
      d.uniqueName = null;
      devices.push(d);
      return devices;
    }));
  }

  private getSocketMapping(pduId: string) {
    return this.http.get<{ data: SocketMapping[] }>(PDU_SOCKET_MAPPING(pduId)).pipe(map(res => res.data));
  }

  buildForm(pduId: string, pduUUID: string, socketCount: number) {
    let form = this.builder.group({
      'data': this.builder.array([]),
      'pduId': new FormControl(pduUUID)
    });
    return this.getSocketMapping(pduId).pipe(map(socketMappings => {
      let scArr: number[] = [];
      for (let i = 1; i <= socketCount; i++) {
        scArr.push(i);
      }
      const smFG = scArr.map(i => {
        const mappings = socketMappings.filter(mapping => mapping.socket_number == i);
        const mapping = mappings.length ? mappings[0] : { socket_number: i };
        if (mapping.id) {
          return this.builder.control(mapping.device_type + ' - ' + mapping.name);
        } else {
          return this.builder.control(null);
        }
      });
      form.setControl('data', this.builder.array(smFG));
      return form;
    }));
  }

  mapSocketData(viewData: PDUViewData): Observable<[Device[], FormGroup]> {
    let res1 = this.getCabinetDevices(viewData.cabinetId).pipe(catchError(() => of(undefined)));
    let res2 = this.buildForm(viewData.id, viewData.pduId, viewData.socketsCount).pipe(catchError(() => of(undefined)));
    return forkJoin(res1, res2);
  }

  convertDeviceToSocketMap(device: Device, socNum: number) {
    let sm: SocketMapping = { uuid: device.uuid, id: device.id, name: device.name, socket_number: socNum, device_type: device.device_type };
    return sm;
  }

  updateSocketMapping(obj: { data: string[], pduId: string }, devices: Device[]) {
    let mappings: SocketMapping[] = [];
    obj.data.map((sm, i) => {
      let device = devices.filter(dv => dv.uniqueName === sm)[0];
      if (device.uniqueName) {
        mappings.push(this.convertDeviceToSocketMap(device, i + 1));
      } else {
        mappings.push({ socket_number: i + 1 });
      }
    });
    return this.http.post(UPDATE_PDU_MAPPING(), { pdu_uuid: obj.pduId, device_mappings: mappings });
  }

  resetAuthFormErrors(): any {
    let AuthFormErrors = {
      'username': '',
      'password': ''
    }
    return AuthFormErrors;
  }

  resetSocketFormErrors(): any {
    let SocketFormErrors = {
      'invalidSocketSelection': ''
    }
    return SocketFormErrors;
  }

  validationMessages = {
    'username': {
      'required': 'This field is required'
    },
    'password': {
      'required': 'This field is required'
    },
    'invalidSocketSelection': {
      'notselcted': 'Select atleast one outlet to recycle',
      'bothselected': 'Socket selection is invalid. Select either ALL SOCKETS or INDIVIDUAL SOCKETS, but not both'
    },
  }

  buildPDUAuthForm(pdu: PDUViewData): FormGroup {
    this.resetAuthFormErrors();
    return this.builder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'ip_address': [pdu.ip],
    });
  }

  buildPDUSocketForm(pdu: PDUViewData): FormGroup {
    this.resetSocketFormErrors();
    return this.builder.group({
      'all_outlets': [false],
      'outlets': this.builder.array([])
    }, { validators: outletValidator('all_outlets', 'outlets') });
  }

  validateSocketForm(form: FormGroup, validationMessages: any, formErrors: any) {
    for (const field in formErrors) {
      formErrors[field] = '';
      const messages = validationMessages[field];
      if (form.errors) {
        for (const key in form.errors) {
          formErrors[field] = messages[key];
        }
      }
    }
    return formErrors;
  }

  checkPDUAuth(pdu: PDUViewData, data: PDUSocketAuthType): Observable<string> {
    return this.http.post<string>(CHECK_PDU_AUTHENTICATION(pdu.id), data);
  }

  recyclePDU(pdu: PDUViewData, data: PDUSocketRecycleType) {
    return this.http.post<CeleryTask>(RECYCLE_PDU(pdu.pduId), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }
}

export function outletValidator(allOutlets: string, outletList: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const all = control.get(allOutlets).value;
    const selectedList = control.get(outletList).value;
    if (all && selectedList.length) {
      return { 'bothselected': true };
    } else if (!all && !selectedList.length) {
      return { 'notselcted': true };
    }
    return null;
  }
}

export class PDUViewData {
  pduId: string;
  id: string;
  name: string;
  ip: string;
  model: string;
  cabinet: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  cabinetId: string;
  statsTooltipMessage: string;
  deviceStatus: string;

  serialNumber: string;
  usableAmps: number;
  voltage: number;
  outletCount: number;
  socketsCount: number;
  pduType: string;
  size: number;
  recycleIconEnabled: boolean = false;
  recycleIconTooltip: string;
  pduSockets: number[] = [];
  tags: string[] = [];

  monitoring: DeviceMonitoringType;

  constructor() { }
}

export class Device {
  device_type: string;
  name: string;
  uuid: string;
  id: number;
  uniqueName: string;
  displayName: string;
  constructor() { }
}

interface SocketMapping {
  socket_number: number;
  uuid?: string;
  name?: string;
  device_type?: string;
  id?: number;
}

export interface PDUSocketAuthType {
  username: string;
  password: string;
  ip_address: string;
}
export interface PDUSocketRecycleType extends PDUSocketAuthType {
  all_outlets: boolean;
  outlets: number[];
}