import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { BusinessServiceData, BusinessServiceType, LicenseCostCenterType, NgSelectDropdownType, RBACGroupType } from '../business-services.type';
import { catchError } from 'rxjs/operators';
import { DropdownViewType } from 'src/app/unity-setup/unity-setup-finops/unity-setup-finops.type';

@Injectable()
export class BusinessServicesCrudService {

  constructor(private http: HttpClient, private builder: FormBuilder) { }

  getDropdownData(): Observable<DropdownViewType> {
    return this.http.get<DropdownViewType>(`/customer/finops/dropdown_values/`);
  }

  getSelectedDropdownData(): Observable<any> {
    return this.http.get<any>(`/apm/business_summary/disabled_list/`);
  }


  // convertDropdownData(data: DropdownViewType): NgSelectDropdownType {
  //   const obj: NgSelectDropdownType = {};
  //   Object.keys(data).forEach((key: string) => {
  //     obj[key] = data[key].dropdown_values;
  //   });
  //   return obj;
  // }

  convertDropdownData(data: any, businessList: string[]): NgSelectDropdownType {
    const obj: NgSelectDropdownType = {};
    Object.keys(data).forEach((key: string) => {
      obj[key] = data[key].dropdown_values.map((val: string) => ({
        name: val,
        disabled: businessList.includes(val)
      }));
    });
    return obj;
  }


  getBusinessDropdownData(): Observable<{ buildingBlock: any[], appList: any[] }> {
    return forkJoin({
      buildingBlock: this.getBuildingBlock().pipe(catchError(error => of(undefined))),
      appList: this.getApplicationList().pipe(catchError(error => of(undefined))),
    })
  }

  getBusinessServiceList(): Observable<BusinessServiceType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<BusinessServiceType[]>(`/apm/business_service/`, { params: params });
  }

  getBusinessServiceData(serviceId: string): Observable<BusinessServiceData> {
    return this.http.get<BusinessServiceData>(`/apm/business_list/${serviceId}/`);
  }

  // getLicenseCostCenter(): Observable<LicenseCostCenterType[]> {
  //   let params: HttpParams = new HttpParams().set('page_size', 0);
  //   return this.http.get<LicenseCostCenterType[]>(`/apm/business_license/`, { params: params });
  // }

  getBuildingBlock(): Observable<LicenseCostCenterType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<LicenseCostCenterType[]>(`/customer/finops/building_blocks/`, { params: params });
  }

  getApplicationList(): Observable<any[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<any[]>(`/apm/app_list/`, { params: params });
  }

  createBusinessService(data: any) {
    return this.http.post(`/apm/business/`, data);
  }


  updateBusinessService(data: any, policyId: string) {
    return this.http.put(`/apm/business/${policyId}/`, data);
  }

  createBusinessDropdown(obj: inputTemplateType) {
    return this.http.post<any>('/apm/business_service/', obj);
  }

  // createGroupDropdown(obj: inputTemplateType) {
  //   return this.http.post<any>('/apm/rbac_group/', obj);
  // }

  createLicenseCenterDropdown(obj: inputTemplateType) {
    return this.http.post<any>('/apm/business_license/', obj);
  }

  buildForm(data?: any): FormGroup {
    return this.builder.group({
      business_service: [data?.business || null, Validators.required],
      description: [data?.description || ''],
      license_cost_centers: this.builder.array(
        data?.license_cost_centers?.length
          ? data.license_cost_centers.map(lc => this.buildLicenseCostCenter(lc))
          : [this.buildLicenseCostCenter()]
      ),
      visibility: [data?.visibility || 'Private', Validators.required],
      status: [data?.status || 'ENABLE', Validators.required]
    });
  }

  private buildLicenseCostCenter(data?: any): FormGroup {
    return this.builder.group({
      license_centre: [data?.license_centre || null, Validators.required],
      building_block_code: [data?.building_block_code || '', Validators.required],
      application: this.builder.array(
        data?.application?.length
          ? data.application.map(app => this.buildApplication(app))
          : [this.buildApplication()]
      )
    });
  }

  private buildApplication(data?: any): FormGroup {
    return this.builder.group({
      app_name_id: [data?.app_name_id || '', Validators.required],
      business_criticality: [data?.business_criticality || '', Validators.required],
      type_of_app: [data?.type_of_app || '', Validators.required],
      cloud_types: [data?.cloud_types || '', Validators.required],
      env: [data?.env || '', Validators.required],
      deployment_model: [data?.deployment_model || '', Validators.required]
    });
  }


  resetFormErrors() {
    return {
      business_service: '',
      description: '',
      license_cost_centers: [this.getLicenseCostCenterErrors()],
      visibility: ''
    };
  }

  getLicenseCostCenterErrors() {
    return {
      license_centre: '',
      building_block_code: '',
      application: [this.getApplicationErrors()]
    };
  }

  getApplicationErrors() {
    return {
      app_name_id: '',
      business_criticality: '',
      type_of_app: '',
      cloud_types: '',
      env: '',
      deployment_model: ''
    };
  }

  formValidationMessages = {
    business_service: {
      required: 'Business service name is required'
    },
    description: {
      required: 'Description is required'
    },
    visibility: {
      required: 'Visibility is required'
    },
    license_cost_centers: {
      license_centre: {
        required: 'License centre is required'
      },
      building_block_code: {
        required: 'Building Block code is required'
      },
      application: {
        app_name_id: {
          required: 'Application name is required'
        },
        business_criticality: {
          required: 'Business criticality is required'
        },
        type_of_app: {
          required: 'Type of application is required'
        },
        cloud_types: {
          required: 'Cloud type is required'
        },
        env: {
          required: 'Environment is required'
        },
        deployment_model: {
          required: 'Deployment model is required'
        }
      }
    }
  };


  buildBusinessServiceForm(): FormGroup {
    return this.builder.group({
      name: ['', Validators.required],
      metadata: this.builder.group({
        data: ['', Validators.required]
      })
    });
  }

  resetBusinessServiceFormErrors() {
    return {
      'name': '',
      'metadata': {
        'data': ''
      }
    }
  }

  businessServiceValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
    'metadata': {
      'data': {
        'required': 'Metadata Data is mandatory'
      }
    }
  }


  buildGroupForm(): FormGroup {
    return this.builder.group({
      name: ['', Validators.required],
      metadata: this.builder.group({
        data: ['', Validators.required]
      })
    });
  }

  resetGroupFormErrors() {
    return {
      'name': '',
      'metadata': {
        'data': ''
      }
    }
  }

  groupValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
    'metadata': {
      'data': {
        'required': 'Metadata Data is mandatory'
      }
    }
  }

  buildLicenseCostForm(): FormGroup {
    return this.builder.group({
      name: ['', Validators.required],
      metadata: this.builder.group({
        data: ['', Validators.required]
      })
    });
  }

  resetLicenseCostFormErrors() {
    return {
      'name': '',
      'metadata': {
        'data': ''
      }
    }
  }

  licenseCostValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
    'metadata': {
      'data': {
        'required': 'Metadata Data is mandatory'
      }
    }
  }

  transformPayload(input: any, licenseCostCenters: any[], buildingBlock: any[], appList: any[]): any {
    const { business_service, description, visibility, status, license_cost_centers } = input;

    const flattened = license_cost_centers.flatMap((centre: any) =>
      centre.application.map((app: any) => {
        const appObj = appList.find(a => a.id === Number(app.app_name_id));

        // find the building block object matching the selected name
        const bbObj = buildingBlock.find(bb => bb.id === Number(centre.building_block_code));

        return {
          license_centre: centre.license_centre,
          building_block_code_id: bbObj?.id || null,      // numeric id
          building_block_code: bbObj?.building_block_code, // the display name from form control
          app_name_id: Number(app.app_name_id),
          app_name: appObj?.name || '',
          business_criticality: app.business_criticality,
          type_of_app: app.type_of_app,
          cloud_types: app.cloud_types,
          env: app.env,
          deployment_model: app.deployment_model
        };
      })
    );

    return { business_service, description, visibility, status, license_cost_centers: flattened };
  }




  // reversePayload(input: any): any {
  //   const { business_name, description, visibility, license_cost_centers } = input;

  //   // Group applications by license centre
  //   const groupedByCentre = license_cost_centers.reduce((acc: any, item: any) => {
  //     const { license_centre, ...appData } = item;
  //     let centre = acc.find((c: any) => c.license_centre === license_centre);
  //     if (!centre) {
  //       centre = { license_centre, application: [] };
  //       acc.push(centre);
  //     }
  //     centre.application.push(appData);
  //     return acc;
  //   }, []);

  //   return {
  //     business_name: Number(business_name), // convert string ID to number
  //     description,
  //     visibility,
  //     license_cost_centers: groupedByCentre
  //   };
  // }

  reversePayload(input: any): any {
    const { business, description, visibility, status, license_cost_centers } = input;

    // Group by license_centre
    const grouped: any[] = license_cost_centers.reduce((acc: any[], item: any) => {
      const { license_centre, building_block_code_id, ...appData } = item;

      // check if this license_centre already exists
      let centre = acc.find(c => c.license_centre === license_centre);
      if (!centre) {
        centre = {
          license_centre,
          building_block_code: building_block_code_id || '', // placeholder if missing
          application: []
        };
        acc.push(centre);
      }

      // push app to this centre's application array
      centre.application.push({
        app_name_id: appData.app_name_id,
        app_name: appData.app_name,
        business_criticality: appData.business_criticality,
        type_of_app: appData.type_of_app,
        cloud_types: appData.cloud_types,
        env: appData.env,
        deployment_model: appData.deployment_model
      });

      return acc;
    }, []);

    return {
      business,
      description,
      visibility,
      status: status || 'ENABLE',
      license_cost_centers: grouped
    };
  }


  updateFields(fields: any) {
    return this.http.patch(`/customer/finops/dropdown_values/update_values/`, fields);
  }
}

export const APPLICATION_TYPE_CHOICES = [
  { value: 'WEB', name: 'Web' },
  { value: 'MIDDLEWARE', name: 'Middleware' },
  { value: 'CLOUD NATIVE APPS', name: 'Cloud Native Apps' },
  { value: 'DATABASE & CACHE INTERACTIONS', name: 'Database & Cache Interactions' },
  { value: 'MICROSERVICES & APIs', name: 'Microservices & APIs' },
  { value: 'FATAL', name: 'Fatal' },
];

export const BUSINESS_CRITICALITY = [
  { value: 'CRITICAL', name: 'Critical' },
  { value: 'HIGH', name: 'High' },
  { value: 'MEDIUM', name: 'Medium' },
  { value: 'LOW', name: 'Low' },
];

export const APP_ENV = [
  { value: 'PRODUCTION', name: 'Production' },
  { value: 'PRE PROD', name: 'Pre-Prod' },
  { value: 'STAGING', name: 'Staging' },
  { value: 'UAT', name: 'UAT' },
  { value: 'QA', name: 'QA' },
  { value: 'TEST', name: 'Test' },
  { value: 'DEV', name: 'Dev' },
];

export const DEPLOYMENT_MODEL = [
  { value: 'ON-PREM', name: 'On-Prem' },
  { value: 'CLOUD', name: 'Cloud' },
  { value: 'HYBRID', name: 'Hybrid' },
  { value: 'MULTI-CLOUD', name: 'Multi-Cloud' },
];

export const CLOUD_TYPES = [
  { value: 'AZURE', name: 'Azure' },
  { value: 'AWS', name: 'AWS' },
  { value: 'GOOGLE CLOUD', name: 'Google' },
  { value: 'ORACLE', name: 'Oracle' },
];
