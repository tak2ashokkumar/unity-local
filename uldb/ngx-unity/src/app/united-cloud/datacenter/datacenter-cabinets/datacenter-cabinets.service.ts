import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { ADD_CABINET, ADD_PANEL_DEVICES, CABINETS_BY_DATACENTER_ID, CABINET_DEVIECS_BY_CABINET_ID, CO2_EMISSION_VALUE_BY_DEVICE_TYPE, DELETE_CABINET, DELETE_PANEL_DEVICE_BY_ID, EDIT_CABINET, GET_PANEL_DEVICES_BY_CABINET, UPDATE_PANEL_DEVICE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DataCenterCabinet } from '../../shared/entities/datacenter-cabinet.type';
import { CabinetDetailsResponse } from '../entities/cabinet-view-device.type';
import { DataCenterPanelDevices, PanelDevicesType } from '../entities/panel-devices.type';

@Injectable()
export class DatacenterCabinetsService {

  constructor(private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getCabinets(dcId: string, criteria: SearchCriteria): Observable<PaginatedResult<DataCenterCabinet>> {
    return this.tableService.getData<PaginatedResult<DataCenterCabinet>>(CABINETS_BY_DATACENTER_ID(dcId), criteria);
  }

  convertToViewData(cabinets: DataCenterCabinet[]): CabinetViewData[] {
    let viewData: CabinetViewData[] = [];
    cabinets.map((cabinet: DataCenterCabinet) => {
      let data = new CabinetViewData();
      data.cabinetId = cabinet.uuid;
      data.name = cabinet.name;
      data.available_size = cabinet.available_size;
      data.capacity = cabinet.size;
      data.model = cabinet.model;
      data.tags = cabinet.tags.filter(tg => tg);
      viewData.push(data);
    });
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'model': '',
      'size': ''
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'model': {
      'required': 'Model is required'
    },
    'size': {
      'required': 'Size is required',
      'max': 'Maximum value should be less than or equal to 72',
      'min': 'Minimum value should be greater than or equal to 1'
    }
  };

  buildForm(cabinet: DataCenterCabinet): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'name': [cabinet ? cabinet.name : '', [Validators.required, NoWhitespaceValidator]],
      'model': [cabinet ? cabinet.model : '', [Validators.required, NoWhitespaceValidator]],
      'size': [cabinet ? cabinet.size : '', [Validators.required, Validators.min(1), Validators.max(72)]]
    });
  }

  addCabinet(cabinet: DataCenterCabinet) {
    return this.http.post(ADD_CABINET(), cabinet);
  }

  updateCabinet(cabinetId: string, cabinet: DataCenterCabinet) {
    return this.http.put(EDIT_CABINET(cabinetId), cabinet);
  }

  deleteCabinet(cabinetId: string) {
    return this.http.delete(DELETE_CABINET(cabinetId));
  }

  getCabinetDetails(cabinetId: string): Observable<CabinetDetailsResponse> {
    return this.http.get<CabinetDetailsResponse>(CABINET_DEVIECS_BY_CABINET_ID(cabinetId));
  }

  getPaneldevices(cabinetId: string): Observable<DataCenterPanelDevices[]> {
    return this.http.get<DataCenterPanelDevices[]>(GET_PANEL_DEVICES_BY_CABINET(cabinetId));
  }

  convertToPanelDevicesViewData(paneldevices: DataCenterPanelDevices[]): CabinetPanelDevicesViewData[] {
    let viewData: CabinetPanelDevicesViewData[] = [];
    paneldevices.map(d => {
      let a: CabinetPanelDevicesViewData = new CabinetPanelDevicesViewData();
      a.deviceId = d.uuid;
      a.name = d.name;
      a.panelType = d.panel_type;
      a.panelDisplayType = d.panel_type_display;
      a.position = d.position;
      a.size = d.size;
      viewData.push(a);
    })
    return viewData;
  }

  resetPanelFormErrors(): any {
    let formErrors = {
      'panel_type': '',
      'name': '',
      'position': '',
      'size': ''
    };
    return formErrors;
  }

  panelValidationMessages(cabinet: CabinetViewData): any {
    return {
      'panel_type': {
        'required': 'Device category mandatory'
      },
      'name': {
        'required': 'Name mandatory'
      },
      'position': {
        'required': 'Position mandatory',
        'max': `Position should be less than or equal to ${cabinet.capacity}`,
        'min': 'Position should be greater than or equal to 0'
      },
      'size': {
        'required': 'Size mandatory',
        'max': 'Size should be less than or equal to 20',
        'min': 'Size should be greater than or equal to 1'
      }
    }
  };

  buildPanelForm(cabinet?: CabinetViewData, device?: CabinetPanelDevicesViewData): FormGroup {
    this.resetFormErrors();
    if (cabinet) {
      return this.builder.group({
        'cabinet': this.builder.group({
          'uuid': [cabinet.cabinetId]
        }),
        'name': [device ? device.name : '', [Validators.required, NoWhitespaceValidator]],
        'panel_type': [device ? device.panelType : '', [Validators.required, NoWhitespaceValidator]],
        'position': [device ? device.position : '', [Validators.required, Validators.min(0), Validators.max(cabinet.capacity)]],
        'size': [device ? device.size : '', [Validators.required, Validators.min(1), Validators.max(20)]]
      });
    } else {
      return this.builder.group({});
    }
  }

  getPanelForm(cabinet?: CabinetViewData, device?: CabinetPanelDevicesViewData): FormGroup {
    this.resetFormErrors();
    if (cabinet) {
      return this.builder.group({
        'cabinet': this.builder.group({
          'uuid': [cabinet.cabinetId]
        }),
        'name': [device ? device.name : '', [Validators.required, NoWhitespaceValidator]],
        'panel_type': [device ? device.panelType : '', [Validators.required, NoWhitespaceValidator]],
        'position': [device ? device.position : '', [Validators.required, Validators.min(0), Validators.max(cabinet.capacity)]],
        'size': [device ? device.size : '', [Validators.required, Validators.min(1), Validators.max(20)]]
      });
    } else {
      return this.builder.group({});
    }
  }

  addPanelDevice(data: PanelDevicesType): Observable<DataCenterPanelDevices[]> {
    return this.http.post<DataCenterPanelDevices[]>(ADD_PANEL_DEVICES(), data);
  }

  updatePanelDevice(deviceId: string, data: PanelDevicesType): Observable<DataCenterPanelDevices[]> {
    return this.http.put<DataCenterPanelDevices[]>(UPDATE_PANEL_DEVICE(deviceId), data);
  }

  deletePanelDevice(deviceId: string, cabinetId: string): Observable<DataCenterPanelDevices[]> {
    return this.http.delete<DataCenterPanelDevices[]>(DELETE_PANEL_DEVICE_BY_ID(deviceId, cabinetId));
  }

}
export class CabinetViewData {
  cabinetId: string;
  name: string;
  available_size: string;
  capacity: number;
  model: string;
  tags: string[] = [];
  constructor() { }
}

export class CabinetPanelDevicesViewData {
  deviceId: string;
  name: string;
  panelType: number;
  panelDisplayType: string;
  position: number;
  size: number;

  editTooltipMessage: string = 'Edit';
  isEditing: boolean = false;

  deleteTooltipMessage: string = 'Delete';
  isDeleting: boolean = false;
  constructor() { }
}