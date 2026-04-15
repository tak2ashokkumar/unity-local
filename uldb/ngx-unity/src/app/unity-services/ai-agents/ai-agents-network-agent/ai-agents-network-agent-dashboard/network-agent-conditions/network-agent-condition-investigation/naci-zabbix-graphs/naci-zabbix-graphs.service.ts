import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import moment from 'moment';
import { DeviceType } from '../naci-chatbot/naci-chatbot.type';

@Injectable()
export class NaciZabbixGraphsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService) { }

  getItemsList(deviceData: any): Observable<ZabbixMonitoringItems[]> {
    const device = deviceData.device;
    const mappedMonitoringType = this.getMonitoringTypeMappingForAPI(deviceData.monitoring_type);
    return this.http.get<ZabbixMonitoringItems[]>(`/mcp/dcim/monitoring_items/?customer_id=${device.customer_id}&device_id=${device.device_id}&device_ct=${device.device_ct}&monitoring_type=${mappedMonitoringType}`);
  }

  convertItemsToViewData(graphList: ZabbixMonitoringItems[], index: number): ZabbixMonitoringItemsViewdata[] {
    let viewData: ZabbixMonitoringItemsViewdata[] = [];
    graphList.map(g => {
      let a = new ZabbixMonitoringItemsViewdata();
      a.itemId = g.item_id.toString();
      a.graphSpinnerName = `${a.itemId}-${index}`;
      a.name = g.name;
      viewData.push(a);
    })
    return viewData;
  }

  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'graph_list': [[], [Validators.required]],
      'period': [ZabbixGraphTimeRange.LAST_24_HOURS, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.sameOrAfterDateRangeValidator('from', 'to') });
  }

  resetFormErrors(): any {
    let formErrors = {
      'graph_list': '',
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
    'graph_list': {
      'required': 'Graph selection is required'
    },
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required',
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getDateRangeByPeriod(graphRange: ZabbixGraphTimeRange): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case ZabbixGraphTimeRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case ZabbixGraphTimeRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case ZabbixGraphTimeRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case ZabbixGraphTimeRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case ZabbixGraphTimeRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getGraph(device: any, itemId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(`/mcp/dcim/item_graph_image/?customer_id=${device.customer_id}&device_id=${device.device_id}&device_ct=${device.device_ct}&item_id=${itemId}`, { params: params })
  }

  getMonitoringTypeMappingForAPI(mappingType: string): string {
    switch (mappingType) {
      case 'Monitoring': return 'monitoring';
      case 'Resource Utilization': return 'resource_utilization';
      case 'Check Device Health': return 'device_health';
    }
  }
}

export enum ZabbixGraphTimeRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class ZabbixMonitoringItemsViewdata {
  graphSpinnerName: string;
  itemId: string;
  name: string;
  image: string;
  constructor() { }
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export interface ZabbixMonitoringItems {
  item_id: number;
  name: string;
  key: string;
  value_type: string;
}