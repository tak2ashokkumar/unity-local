import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DATA_CENTERS } from 'src/app/shared/api-endpoint.const';
import { ManageReportDatacenterType } from './datacenter-report-crud.type';

@Injectable()
export class DatacenterReportCrudService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private router: Router) { }

  getDataCenters(): Observable<ManageReportDatacenterType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', '0');
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: params })
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

  buildForm(datacenter: ManageReportDatacenterFormData) {
    return this.builder.group({
      'datacenters': [datacenter ? datacenter.datacenters : [], [Validators.required]],
      'cabinets': [datacenter ? datacenter.cabinets : [], []],
      'reportType': [datacenter ? datacenter.reportType : 'cabinet', [Validators.required]],
      'report_url': [this.router.url]
    });
  }

  resetFormErrors() {
    return {
      'datacenters': '',
      'reportType': ''
    };
  }

  formValidationMessages = {
    'datacenters': {
      'required': 'Datacenter selection is mandatory'
    },
    'reportType': {
      'required': 'Report Type is mandatory'
    }
  }

}

/**
 * Dropdown data related classes
 */
export class ManageReportDatacenterView {
  uuid: string;
  id: string;
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
  datacenters: string[];
  cabinets: string[];
  reportType: string;
  report_url: string;
  device_list: boolean;
}