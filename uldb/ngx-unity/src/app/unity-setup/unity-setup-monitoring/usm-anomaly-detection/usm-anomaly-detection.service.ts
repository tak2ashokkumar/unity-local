import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { DISABLE_TRIGGER, ENABLE_TRIGGER, TRIGGERS_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsmAnomalyDetectionService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getAnomalyDetections(criteria: SearchCriteria): Observable<PaginatedResult<anomalyDetectionType>> {
    return this.tableService.getData<PaginatedResult<anomalyDetectionType>>(`/customer/anamoly_detection/get_devices`, criteria);
  }

  convertToViewData(data: anomalyDetectionType[]) {
    let viewData: anomalyDetectionViewData[] = [];
    data.forEach((d) => {
      let view: anomalyDetectionViewData = new anomalyDetectionViewData();
      view.deviceObj = d.device_obj;
      view.eventCount = d.event_count;
      view.deviceHostId = d.device_host_id;
      view.deviceName = d.device_name;
      view.deviceType = d.device_type;
      view.deviceId = d.device_uuid;
      view.triggerId = d.trigger_details?.trigger_id;
      view.triggerName = d.trigger_details?.name;
      view.triggerCreatedOn = d.created_on ? this.utilSvc.toUnityOneDateFormat(d.created_on) : 'NA';
      // view.triggerCreatedBy = d.trigger_created_by ? d.trigger_created_by : 'NA';
      // view.triggerModifiedBy = d.trigger_modified_by ? d.trigger_modified_by : 'NA';
      view.triggerExpression = d.trigger_details?.expression;
      view.triggerState = d.trigger_details?.state;
      view.triggerSeverity = d.trigger_details?.severity;
      switch (d.trigger_details?.severity) {
        case 'critical':
          view.tiggerSeverityClass = 'fas fa-exclamation-triangle text-danger';
          view.triggerSeverityTooltip = 'Critical';
          break;
        case 'warning':
          view.tiggerSeverityClass = 'fas fa-exclamation-circle text-warning fa-lg';
          view.triggerSeverityTooltip = 'Warning';
          break;
        case 'information':
          view.tiggerSeverityClass = 'fas fa-info-circle text-primary fa-lg';
          view.triggerSeverityTooltip = 'Information';
          break;
      }
      view.isTriggerDisabled = d.trigger_details?.disabled;
      view.triggerMode = d.trigger_details?.mode;
      view.triggerCanUpdate = d.trigger_details?.can_update;
      view.triggerCanDelete = d.trigger_details?.can_delete;
      viewData.push(view);
    })
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  enableTrigger(device: anomalyDetectionViewData, triggerId: string) {
    let deviceTypeMapped = this.utilSvc.getDeviceMappingByDeviceType(device.deviceType);
    return this.http.post(ENABLE_TRIGGER(deviceTypeMapped, device.deviceId, triggerId), {});
  }

  disableTrigger(device: anomalyDetectionViewData, triggerId: string) {
    let deviceTypeMapped = this.utilSvc.getDeviceMappingByDeviceType(device.deviceType);
    return this.http.post(DISABLE_TRIGGER(deviceTypeMapped, device.deviceId, triggerId), {});
  }

  deleteTrigger(device: anomalyDetectionViewData, triggerId: string) {
    let deviceTypeMapped = this.utilSvc.getDeviceMappingByDeviceType(device.deviceType);
    return this.http.delete(TRIGGERS_BY_DEVICE_TYPE(deviceTypeMapped, device.deviceId, triggerId));
  }

}

export class anomalyDetectionViewData {
  constructor() { }
  deviceObj: string;
  eventCount: number;
  deviceHostId: number;
  deviceName: string;
  deviceType: string;
  deviceId: string;

  triggerId: number;
  triggerName: string;
  triggerExpression: string;
  triggerState: string;
  triggerSeverity: string;
  triggerSeverityTooltip: string;
  tiggerSeverityClass: string;
  triggerCreatedOn: string;
  triggerCreatedBy: string;
  triggerModifiedBy: string;
  isTriggerDisabled: boolean;
  triggerMode: number;
  triggerCanUpdate: boolean;
  triggerCanDelete: boolean;
}

export interface anomalyDetectionType {
  device_obj: string;
  event_count: number;
  device_host_id: number;
  device_name: string;
  device_type: string;
  device_uuid: string;
  created_on: string;
  trigger_details: anomalyDetectionTriggerDetailsType;
}

export interface anomalyDetectionTriggerDetailsType {
  trigger_id: number;
  name: string;
  expression: string;
  state: string;
  severity: string;
  disabled: boolean;
  mode: number;
  can_update: boolean;
  can_delete: boolean;
}

export const anomalyDetectionColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Trigger Name',
    'key': 'triggerName',
    'default': true,
    'mandatory': true,
    // 'type': 'btn-link'
    // 'sortTableColumnName': 'trigger_name'
  },
  {
    'name': 'Device Name',
    'key': 'deviceName',
    'default': true,
    'mandatory': true,
    // 'sortTableColumnName': 'device_name'
  },
  {
    'name': 'Active Events',
    'key': 'eventCount',
    'default': true,
    'mandatory': false,
    // 'sortTableColumnName': 'events'
  },
  {
    'name': 'Created On',
    'key': 'triggerCreatedOn',
    'default': true,
    'mandatory': false,
    // 'sortTableColumnName': 'created_on'
  },
  {
    'name': 'Status',
    'key': 'isTriggerDisabled',
    'default': true,
    'mandatory': false,
    'type': 'status-btn',
    // 'sortTableColumnName': 'status'
  },
  {
    'name': 'Created By',
    'key': 'triggerCreatedBy',
    'default': true,
    'mandatory': false,
    'type': 'status-btn',
  },
  {
    'name': 'Modified By',
    'key': 'triggerModifiedBy',
    'default': true,
    'mandatory': false,
    'type': 'status-btn',
  },
];