import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CO2_EMISSION_BY_DEVICES, GET_CABINET_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GreenITService } from '../green-it.service';
import { GreenItUsageByDevice } from './green-it-usage.type';
import * as moment from 'moment';

@Injectable()
export class GreenItUsageService {

  constructor(private http: HttpClient,
    private greenItService: GreenITService,
    private builder: FormBuilder, ) { }

  getDataCenters(): Observable<any[]> {
    return this.http.get<any[]>(GET_CABINET_WIDGET_DATA());
  }

  getUsageData(filters?: any): Observable<GreenItUsageByDevice[]> {
    if (filters) {
      return this.http.post<GreenItUsageByDevice[]>(CO2_EMISSION_BY_DEVICES(), filters);
    } else {
      return this.http.get<GreenItUsageByDevice[]>(CO2_EMISSION_BY_DEVICES());
    }
  }

  convertToViewData(ud: GreenItUsageByDevice[]): GreenItUsageByDeviceViewData[] {
    let viewData: GreenItUsageByDeviceViewData[] = [];
    ud.map(d => {
      let a: GreenItUsageByDeviceViewData = new GreenItUsageByDeviceViewData();
      a.deviceName = d.name;
      a.ipAddress = d.ip_address ? d.ip_address : 'N/A';
      a.region = d.region ? d.region : 'N/A';
      a.datacenter = d.data_center ? d.data_center : 'N/A';
      a.cabinet = d.cabinet ? d.cabinet : 'N/A';
      a.deviceType = d.type;
      a.deviceMapping = this.greenItService.getMappingForDeviceType(d.type);
      a.model = d.model ? d.model : 'N/A';
      a.powerUsage = this.greenItService.getFormattedNumber(d.power_consumed);
      a.co2Emission = this.greenItService.getFormattedNumber(d.co2_emitted);
      a.uptime = d.uptime;
      a.tags = d.tags;
      viewData.push(a);
    })
    return viewData;
  }

  buildFilterForm(datacenters: any, dateRange: DateRange): FormGroup {
    let dcs: string[] = [];
    datacenters.map(dc => dcs.push(dc.datacenter_uuid));
    let dtps: string[] = [];
    deviceTypes.map(dt => dtps.push(dt.name));
    return this.builder.group({
      'data_center': [dcs],
      'cabinets': [[]],
      'device_types': [dtps],
      'period': [Duration.CURRENT_YEAR, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetFilterFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  filterFormValidationMessages = {
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required'
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getDateRangeByPeriod(duration: Duration): DateRange {
    const format = new DateRange().format;
    switch (duration) {
      case Duration.CURRENT_YEAR:
        return { from: moment().startOf('y').format(format), to: moment().subtract(1, 'm').format(format) };
      case Duration.CURRENT_QUARTER:
        return { from: moment().startOf('quarter').format(format), to: moment().subtract(1, 'm').format(format) };
      case Duration.LAST_QUARTER:
        return { from: moment().subtract(1, 'quarter').startOf('quarter').format(format), to: moment().subtract(1, 'quarter').endOf('quarter').format(format) };
      case Duration.LAST_TWO_QUARTERS:
        return { from: moment().subtract(2, 'quarter').startOf('quarter').format(format), to: moment().subtract(1, 'quarter').endOf('quarter').format(format) };
      case Duration.LAST_THREE_QUARTERS:
        return { from: moment().subtract(3, 'quarter').startOf('quarter').format(format), to: moment().subtract(1, 'quarter').endOf('quarter').format(format) };
      case Duration.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}


export class GreenItUsageByDeviceViewData {
  deviceName: string;
  ipAddress: string;
  region: string;
  datacenter: string;
  cabinet: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  model: string;
  powerUsage: number;
  co2Emission: number;
  uptime: number;
  tags: string[]
  constructor() { }
}

/**
 * Filter selection related class
 */
export class UsageFilterData {
  data_center: string[] = [];
  cabinets: string[] = [];
  device_types: string[] = [];
  period: string;
  from: string;
  to: string;
  constructor() { }
}

export const deviceTypes: Array<{ name: string, displayName: string, mapping: DeviceMapping }> = [
  {
    name: "switch",
    displayName: "Switch",
    mapping: DeviceMapping.SWITCHES
  },
  {
    name: "firewall",
    displayName: "Firewall",
    mapping: DeviceMapping.FIREWALL
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer",
    mapping: DeviceMapping.LOAD_BALANCER
  },
  {
    name: "storage",
    displayName: "Storage",
    mapping: DeviceMapping.STORAGE_DEVICES
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor",
    mapping: DeviceMapping.HYPERVISOR
  },
  {
    name: "baremetal",
    displayName: "Baremetal",
    mapping: DeviceMapping.BARE_METAL_SERVER
  },
  {
    name: "mac_device",
    displayName: "Mac Device",
    mapping: DeviceMapping.MAC_MINI
  },
  {
    name: "custom",
    displayName: "Custom",
    mapping: DeviceMapping.OTHER_DEVICES
  }
];


export class TableColumnMapping {
  constructor() { }
  name: string;
  key: string;
  default: boolean;
  mandatory: boolean;
  type?: string
}

export const columnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Device Name',
    'key': 'deviceName',
    'default': true,
    'mandatory': true,
  },
  {
    'name': 'IP Address',
    'key': 'ipAddress',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'DC Name',
    'key': 'datacenter',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Region',
    'key': 'region',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Cabinet',
    'key': 'cabinet',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Type',
    'key': 'deviceType',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Model',
    'key': 'model',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Power Usage (kilowatt-hour)',
    'key': 'powerUsage',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'CO2 Emission (TCO2e)',
    'key': 'co2Emission',
    'default': true,
    'mandatory': true
  },
  {
    'name': 'Uptime',
    'key': 'uptime',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Tags',
    'key': 'tags',
    'default': false,
    'mandatory': false,
    'type': 'tags'
  }
];

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
};

export enum Duration {
  CURRENT_YEAR = 'current_year',
  CURRENT_QUARTER = 'current_quarter',
  LAST_QUARTER = 'last_quarter',
  LAST_TWO_QUARTERS = 'last_two_quarters',
  LAST_THREE_QUARTERS = 'last_three_quarters',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}
