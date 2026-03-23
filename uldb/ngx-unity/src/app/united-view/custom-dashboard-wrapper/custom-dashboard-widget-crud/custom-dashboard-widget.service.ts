import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CREATE_CUSTOM_DASHBOARD_WIDGET, GET_ALL_DEVICES_TAGS, GET_CUSTOM_DASHBOARD_WIDGET_BY_ID, GET_DATASET_ITEMS, GET_TAGGED_DEVICES, UPDATE_CUSTOM_DASHBOARD_WIDGET } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class CustomDashboardWidgetCrudService {
  private addOrEditAnnouncedSource = new Subject<number>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<number>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(id: number) {
    this.addOrEditAnnouncedSource.next(id);
  }

  deleteWidget(id: number) {
    this.deleteAnnouncedSource.next(id);
  }

  getTags() {
    return this.http.get<{ tag_name: string, id: number, uuid: string }[]>(GET_ALL_DEVICES_TAGS());
  }

  getTaggedDevices(tagIds: number[]) {
    let params: HttpParams = new HttpParams();
    tagIds.forEach(tagId => {
      params = params.append('tag', tagId);
    });
    return this.http.get<{ device_name: string, id: number, uuid: string }[]>(GET_TAGGED_DEVICES(), { params: params });
  }

  getItems(deviceIds: string[]) {
    // return of([
    //   {
    //     "item_id": 307485,
    //     "item_name": "CPU - usage on core '0'",
    //     "host_id": 13054,
    //     'device_name': 'Test'
    //   },
    //   {
    //     "item_id": 307440,
    //     "item_name": "ICMP ping",
    //     "host_id": 13054,
    //     'device_name': 'Test'
    //   },
    //   {
    //     "item_id": 3074889,
    //     "item_name": "CPU - usage on core '0'",
    //     "host_id": 13054,
    //     'device_name': 'Test 2'
    //   },
    //   {
    //     "item_id": 30744456,
    //     "item_name": "ICMP ping",
    //     "host_id": 13054,
    //     'device_name': 'Test 4'
    //   }
    // ])
    let params: HttpParams = new HttpParams();
    deviceIds.forEach(deviceId => {
      params = params.append('device_uuid', deviceId);
    });
    return this.http.get<DatasetItemType[]>(GET_DATASET_ITEMS(), { params: params });
  }

  createForm(widgetId?: number) {
    if (widgetId) {
      return this.http.get<CustomDashboardWidgetCRUDType>(GET_CUSTOM_DASHBOARD_WIDGET_BY_ID(widgetId)).pipe(
        map(widget => {
          let form = this.builder.group({
            'uuid': [widget.uuid],
            'id': [widget.id],
            'name': [widget.name, [Validators.required, NoWhitespaceValidator]],
            'category': [widget.category, [Validators.required]],
            'tags': [widget.tags, [Validators.required]],
            'devices': [widget.devices, [Validators.required]],
            'datasets': this.builder.array(widget.datasets.map(dataset => this.getDatasetFormGroup(dataset))),
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'category': ['', [Validators.required]],
        'tags': [[], [Validators.required]],
        'devices': [[], [Validators.required]],
        'datasets': this.builder.array([]),
      }));
    }
  }

  private getDatasetFormGroup(dataset: WidgetDatasetTypes) {
    return this.builder.group({
      'dataset_name': [dataset.dataset_name, [Validators.required]],
      'items': [dataset.items, [Validators.required, Validators.maxLength(10)]],
      'aggregation': [dataset.aggregation, [Validators.required]],
      'show_value': [{ value: dataset.show_value, disabled: false }],
      'show_graph': [{ value: dataset.show_graph, disabled: false }]
    });
  }

  newDataset(): FormGroup {
    let group = this.builder.group({
      'dataset_name': ['', [Validators.required]],
      'items': [[], [Validators.required, Validators.maxLength(10)]],
      'aggregation': ['', [Validators.required]],
      'show_value': [{ value: true, disabled: false }],
      'show_graph': [{ value: true, disabled: false }]
    });
    return group;
  }

  getDatasetFormErrors() {
    return {
      'dataset_name': '',
      'items': '',
      'aggregation': ''
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'category': '',
      'tags': '',
      'devices': '',
      'datasets': []
    }
  }

  validationMessages = {
    'name': {
      'required': 'Widget name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'tags': {
      'required': 'Select atleast one tag'
    },
    'devices': {
      'required': 'Select atleast one device'
    },
    'dataset_name': {
      'required': 'Dataset name is required'
    },
    'items': {
      'required': 'Select atleast one item',
      'maxlength': 'Max 10 items can be selected'
    },
    'aggregation': {
      'required': 'Aggregation is required'
    },
  }

  createWidget(obj: CustomDashboardWidgetCRUDType) {
    // console.log(obj)
    // return
    return this.http.post<CustomDashboardWidgetCRUDType>(CREATE_CUSTOM_DASHBOARD_WIDGET(), obj)
  }

  updateWidget(id: number, obj: CustomDashboardWidgetCRUDType) {
    return this.http.put<CustomDashboardWidgetCRUDType>(UPDATE_CUSTOM_DASHBOARD_WIDGET(id), obj)
  }

  confirmDeleteWidget(id: number) {
    return this.http.delete<CustomDashboardWidgetCRUDType>(UPDATE_CUSTOM_DASHBOARD_WIDGET(id))
  }
}

export interface CustomDashboardWidgetCRUDType {
  uuid?: string;
  id: number;
  name: string;
  category: string;
  tags: number[];
  devices: string[];
  datasets: WidgetDatasetTypes[];
}

export interface WidgetDatasetTypes {
  dataset_name: string;
  items: number[];
  aggregation: string;
  show_value: boolean;
  show_graph: boolean;
}

export interface DatasetItemType {
  item_id: number;
  item_name: string;
  host_id: number;
  device_name: string;
}