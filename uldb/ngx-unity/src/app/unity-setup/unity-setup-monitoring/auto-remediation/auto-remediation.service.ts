import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AppUtilityService, DateRange, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AutoRemediationType, SummaryType } from './auto-remediation.type';

@Injectable()
export class AutoRemediationService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService,
    private buiilder: FormBuilder) { }

  getAutoRemediation(criteria: SearchCriteria): Observable<PaginatedResult<AutoRemediationType>> {
    return this.tableService.getData<PaginatedResult<AutoRemediationType>>(`/ssr/auto_remediation/`, criteria);
  }

  deleteAutoRem(uuid: string) {
    return this.http.delete(`/ssr/auto_remediation/${uuid}/`);
  }

  toggleStatus(uuid: string) {
    return this.http.get(`/ssr/auto_remediation/${uuid}/toggle/`);
  }

  getAutoRemSummary(formData: any): Observable<SummaryType> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<SummaryType>(`/ssr/auto_remediation/list_summary/`, { params: params });
  }

  convertToViewData(data: AutoRemediationType[]): AutoRemediationViewData[] {
    let viewData: AutoRemediationViewData[] = [];
    data.forEach(a => {
      let td: AutoRemediationViewData = new AutoRemediationViewData();
      td.uuid = a.uuid;
      td.name = a.name;

      td.triggerName = a.trigger_ids.length ? a.trigger_ids[0].name : '';
      td.extraTriggersList = a.trigger_ids.length ? a.trigger_ids.slice(1).map(t => t.name) : [];
      td.triggersBadgeCount = a.trigger_ids.length ? a.trigger_ids.length - 1 : 0;

      td.deviceTypes = a.devices.length ? a.devices : [];
      td.deviceType = a.devices.length ? a.devices.getFirst() : '';
      td.extraUsersList = a.devices.length ? a.devices.slice(1) : [];
      td.usersBadgeCount = a.devices.length ? a.devices.length - 1 : 0;
      td.remediationTask = a.remediation_task;
      td.script = a.script;
      td.lastRemediation = a.last_remediation ? this.util.toUnityOneDateFormat(a.last_remediation) : 'N/A';
      td.enabled = a.enabled;

      td.remediationStatus = a.remediation_status;
      if (a.remediation_status == 'Success') {
        td.statusIcon = "fa fa-check-circle text-success";
        td.tooltipMessage = "Success"
      } else if (a.remediation_status == 'Failed') {
        td.statusIcon = "fa fa-exclamation-circle text-danger";
        td.tooltipMessage = "Failed"
      } else if (a.remediation_status == 'Running') {
        td.statusIcon = "fa fa-spinner fa-spin fa-info-circle text-primary";
        td.tooltipMessage = "Running"
      } else {
        td.remediationStatus = 'N/A';
        td.statusIcon = '';
        td.tooltipMessage = '';
      }

      td.createdBy = a.created_by_name ? a.created_by_name : 'N/A';
      td.modifiedBy = a.edited_by ? a.edited_by : 'N/A';
      td.createdOn = a.created_at ? this.util.toUnityOneDateFormat(a.created_at) : 'N/A';
      td.modifiedOn = a.updated_at ? this.util.toUnityOneDateFormat(a.updated_at) : 'N/A';
      viewData.push(td);
    });
    return viewData;
  }

  convertToViewDataSummary(data: any): SummaryViewData {
    let viewData = new SummaryViewData();
    viewData.failed = data.results.failed;
    viewData.execution = data.results.execution;
    viewData.success = data.results.success;
    viewData.total = data.results.total;
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }


  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'period': [ZabbixGraphTimeRange.LAST_24_HOURS, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.sameOrAfterDateRangeValidator('from', 'to') });
  }

  resetFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
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

}

export enum ZabbixGraphTimeRange {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export const nodesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Devices',
    'key': 'deviceType',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Trigger',
    'key': 'triggerName',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Remediation Task',
    'key': 'remediationTask',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Last Remediation',
    'key': 'lastRemediation',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Remediation Status',
    'key': 'remediationStatus',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Created On',
    'key': 'createdOn',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Created By',
    'key': 'createdBy',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Modified On',
    'key': 'modifiedOn',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Modified By',
    'key': 'modifiedBy',
    'default': false,
    'mandatory': false
  }
]

export class AutoRemediationViewData {
  uuid: string;
  name: string;
  deviceTypes: string[];
  deviceType: string;
  hostMapping: HostMappingItem[];
  parameterMapping: ParameterMappingItem[];
  remediationTask: string;
  triggerIds: TriggerIdsItem[];
  taskType: string;
  credType: string;
  enabled: boolean;
  credentials: string;
  extraUsersList: string[];
  usersBadgeCount: number;
  triggerName: string;
  extraTriggersList: string[];
  triggersBadgeCount: number;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
  remediationStatus: string;
  lastRemediation: string;
  statusIcon: string;
  tooltipMessage: string;
  script: string;
}

export class DevicesItem {
  id: number;
  uuid: string;
  name: string;
  monitoring: Monitoring;
  deviceType: string;
}

export class Monitoring {
  configured: boolean;
  observium: boolean;
  enabled: boolean;
  zabbix: boolean;
}

export class HostMappingItem {
  mappingType: string;
  eventAttribute: string;
  expression: string;
}

export class ParameterMappingItem {
  paramName: string;
  mappingType: string;
  eventAttribute: string;
  expression: string;
}

export class TriggerIdsItem {
  name: string;
  deviceTriggers: number[];
}

export class SummaryViewData {
  failed: number;
  execution: number;
  total: number;
  success: number;
}
