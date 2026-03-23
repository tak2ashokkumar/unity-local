import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DeviceDiscoveryNetworkScan } from './device-discovery-network-scan.type';
import { DEVICE_DISCOVERY_NW_SCAN, DELETE_DEVICE_DISCOVERY_NW_SCAN, CANCEL_DEVICE_DISCOVERY_NW_SCAN } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class DeviceDiscoveryNetworkScanService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getnwScan() {
    return this.http.get<DeviceDiscoveryNetworkScan[]>(DEVICE_DISCOVERY_NW_SCAN());
  }

  convertToViewData(data: DeviceDiscoveryNetworkScan[]): DeviceDiscoveryNetworkScanViewdata[] {
    let viewData: DeviceDiscoveryNetworkScanViewdata[] = [];
    data.map(nwScan => {
      let view = new DeviceDiscoveryNetworkScanViewdata();
      view.nwRange = nwScan.network_range;
      view.snmp = nwScan.snmp_community;
      if (nwScan.scan_status == NetworkScanStatus.INITIATED) {
        view.scanStatus = NetworkScanStatus.IN_PROGRESS;
        view.scanStatusInProgress = true;
      } else {
        view.scanStatus = nwScan.scan_status;
        view.scanStatusInProgress = false;
      }
      view.uuid = nwScan.uuid;
      viewData.push(view);
    });
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'network_range': '',
      'snmp_community': ''
    };
    return formErrors;
  }

  validationMessages = {
    'network_range': {
      'required': 'Network CIDR is required',
      'pattern': 'Please enter valid CIDR'
    },
    'snmp_community': {
      'required': 'SNMP community is required'
    }
  };

  buildForm(): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'snmp_community': ['', [Validators.required, NoWhitespaceValidator]],
      'network_range': ['', [Validators.required, NoWhitespaceValidator, Validators.pattern(/((\b|\.)(0|1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(0|1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((0|1|2|3(?=1|2))\d|\d))\b/)]],
    });
  }

  startScan(data: DeviceDiscoveryNetworkScan) {
    return this.http.post<any>(DEVICE_DISCOVERY_NW_SCAN(), data);
  }

  deleteScan(uuid: string) {
    return this.http.delete<any>(DELETE_DEVICE_DISCOVERY_NW_SCAN(uuid));
  }


  cancelScan(uuid: string) {
    return this.http.get<any>(CANCEL_DEVICE_DISCOVERY_NW_SCAN(uuid));
  }
}

export class DeviceDiscoveryNetworkScanViewdata {
  constructor() { }
  snmp: string;
  nwRange: string;
  scanStatus: string;
  scanStatusInProgress: boolean;
  uuid: string;
}

export enum NetworkScanStatus {
  INITIATED = 'Initiated',
  CANCELLED = 'Cancelled',
  IN_PROGRESS = 'In Progress',
  FAILED = 'Failed',
  COMPLETED = 'Completed',
}
