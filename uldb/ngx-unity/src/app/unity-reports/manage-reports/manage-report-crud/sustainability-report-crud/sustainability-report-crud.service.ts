import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DATA_CENTERS, GET_AWSCO2_ACCOUNT_LIST, GET_GCP_ACCOUNT_LIST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportDatacenterType } from '../datacenter-report-crud/datacenter-report-crud.type';
import moment from 'moment';

@Injectable()
export class SustainabilityReportCrudService {

  constructor(private http: HttpClient, private builder: FormBuilder) { }

  buildForm(report: MetaReportFormData): FormGroup {
    return this.builder.group({
      'report_type': [report ? report.report_type : '', [Validators.required, NoWhitespaceValidator]],
    })
  }

  selectionSpecificForm(data: MetaReportFormData, form: FormGroup, option: string, dateRange: DateRange) {
    if (data) {
      //Edit Flow
      if (option == 'sustainability_devices') {
        form.addControl('dc_uuids', new FormControl(data.dc_uuids ? data.dc_uuids : [], [Validators.required]));
        form.addControl('cabinet_uuids', new FormControl(data.cabinet_uuids ? data.cabinet_uuids : [], [Validators.required]));
        form.addControl('period', new FormControl(data.period ? data.period : Duration.CURRENT_YEAR, [Validators.required]));
        form.addControl('from', new FormControl({ value: moment(data.from, "YYYY-MM").startOf('month').toDate(), disabled: data.period == 'custom' ? false : true }, [Validators.required, NoWhitespaceValidator]));
        form.addControl('to', new FormControl({ value: moment(data.to, "YYYY-MM").endOf('month').toDate(), disabled: data.period == 'custom' ? false : true }, [Validators.required, NoWhitespaceValidator]));
        form.addControl('device_types', new FormControl(data.device_types));
      }
      else if (option == 'sustainability_aws') {
        form.addControl('account', new FormControl(data.account ? data.account : [], [Validators.required]));
      }
      else {
        form.addControl('uuid', new FormControl(data.uuid ? data.uuid : [], [Validators.required]));
      }
    } else {
      //Create Flow
      if (option == 'sustainability_devices') {
        let dtps: string[] = [];
        deviceTypes.map(dt => dtps.push(dt.name));

        form.addControl('dc_uuids', new FormControl([], [Validators.required]));
        form.addControl('cabinet_uuids', new FormControl([], [Validators.required]));
        form.addControl('period', new FormControl(Duration.CURRENT_YEAR, [Validators.required]));
        form.addControl('from', new FormControl({ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]));
        form.addControl('to', new FormControl({ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]));
        form.addControl('device_types', new FormControl([], [Validators.required]));
      }
      else if (option == 'sustainability_aws') {
        form.addControl('account', new FormControl([], [Validators.required]));
      }
      else {
        form.addControl('uuid', new FormControl([], [Validators.required]));
      }
    }
    return form;
  }

  resetFormErrors() {
    return {
      'report_type': '',
      'dc_uuids': '',
      'cabinet_uuids': '',
      'period': '',
      'from': '',
      'to': '',
      'device_types': '',
      'uuid': '',
      'account': '',

    };
  }

  formValidationMessages = {
    report_type: {
      'required': 'Report Type is mandatory'
    },
    dc_uuids: {
      'required': 'Datacenter selection is mandatory'
    },
    cabinet_uuids: {
      'required': 'Cabinet selection is mandatory'
    },

    period: {
      'required': 'Period selection is mandatory'
    },
    from: {
      'required': 'From selection is mandatory'
    },
    to: {
      'required': 'To selection is mandatory'
    },
    device_types: {
      'required': 'Device type selection is mandatory'
    },
    account: {
      'required': 'Account selection is mandatory'
    },
    uuid: {
      'required': 'Account selection is mandatory'
    }
  }

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


  getDataCenters(): Observable<ManageReportDatacenterType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: params })
  }

  getAwsAccounts() {
    return this.http.get<AWSAccountReportFormData[]>(GET_AWSCO2_ACCOUNT_LIST());
  }
  getGcpAccounts() {
    return this.http.get<GCPAccountReportFormData[]>(GET_GCP_ACCOUNT_LIST());
  }

  convertToManageReportDatacenterView(datacenters: ManageReportDatacenterType[]) {
    let viewData: ManageReportDatacenterView[] = [];
    datacenters.map(dc => {
      let a: ManageReportDatacenterView = new ManageReportDatacenterView();
      a.uuid = dc.uuid;
      a.name = dc.name;

      let aCabinets: ManageReportDatacenterCabinetView[] = [];
      dc.cabinets.map(dcc => {
        let ac: ManageReportDatacenterCabinetView = new ManageReportDatacenterCabinetView();
        ac.uuid = dcc.uuid;
        ac.name = dcc.name;
        aCabinets.push(ac);
      })
      a.cabinets = aCabinets;

      viewData.push(a);
    })
    return viewData;
  }
}

export class ManageReportDatacenterView {
  uuid: string;
  name: string;
  cabinets: ManageReportDatacenterCabinetView[];
  constructor() { }
}

export class ManageReportDatacenterCabinetView {
  uuid: string;
  name: string;
  constructor() { }
}

export interface ManageReportDatacenterFormData {
  report_type: string;
  dc_uuids: string[];
  cabinet_uuids: any[];
  period: string;
  from: string;
  to: string;
  device_types: string[];
}

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

export interface AWSAccountReportFormData {
  account_name: string;
  account_id: string[];
  name: string;
}
export interface GCPAccountReportFormData {
  co2emission_enabled: boolean;
  platform_type: string;
  uuid: string;
  name: string;
}

export interface MetaReportFormData {
  uuid?: string[] | string;
  report_type?: string;
  account?: string[];
  dc_uuids?: string[];
  from?: string;
  device_types?: string[];
  cabinet_uuids?: string[];
  period?: string;
  to?: string;
  duration?: string;
  datacenters?: string[];
  report_url?: string;
  cabinets?: string[];
  reportType?: string;
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



