import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DEVICE_DISCOVERY_SCAN_OP } from 'src/app/shared/api-endpoint.const';
import { FormControl } from '@angular/forms';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoveryScanOpService {

  constructor(private http: HttpClient) { }

  getDeviceDiscoveryScanOp() {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP());
  }

  convertToViewData(data: DeviceDiscoveryScanOp[]): DeviceDiscoveryScanOpViewdata[] {
    let viewData: DeviceDiscoveryScanOpViewdata[] = [];
    data.map(op => {
      let view = new DeviceDiscoveryScanOpViewdata();
      view.hostname = op.hostname;
      view.ip = op.ip_address;
      view.manufaturer = op.manufaturer ? op.manufaturer : 'N/A';
      view.model = op.model;
      view.dbPK = op.db_pk;
      view.deviceType = op.device_type ? op.device_type : '';
      view.os = op.os;
      view.uniqueId = op.unique_id;
      view.version = op.version;
      viewData.push(view);
    });
    return viewData;
  }

  updateDeviceType(data: { unique_id: string, device_type: string }) {
    return this.http.put(DEVICE_DISCOVERY_SCAN_OP(), data);
  }

  deleteDevice(uniqueId: string) {
    let params = new HttpParams().set('unique_id', uniqueId);
    return this.http.delete(DEVICE_DISCOVERY_SCAN_OP(), { params: params });
  }
}
export class DeviceDiscoveryScanOpViewdata {
  hostname: string;
  ip: string;
  manufaturer: string;
  version: string;
  _deviceType: string;
  model: string;
  os: string;
  uniqueId: string;
  _lastType: string;
  select: FormControl;
  dbPK: string;

  constructor() {
    this.select = new FormControl();
  }

  isSelected(type: string) {
    return this.deviceType === type;
  }

  set lastType(type: string) {
    this._lastType = type;
  }

  get lastType() {
    return this._lastType;
  }

  set deviceType(type: string) {
    this._deviceType = type;
    this.lastType = type;
    this.select.setValue(type);
    if (this.changeDisabled) {
      this.select.disable();
    }
  }

  get changeDisabled() {
    return this.dbPK ? true : false;
  }

  get deviceType() {
    return this._deviceType;
  }
}