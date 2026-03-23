import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_REPORT_BY_ID, MANAGE_CREATE_REPORT, UPDATE_REPORT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportDatacenterFormData } from './datacenter-report-crud/datacenter-report-crud.service';
import { ManageReportPrivateCloudFormData } from './private-cloud-report-crud/private-cloud-report-crud.service';
import { ManageReportPublicCloudFormData } from './public-cloud-report-crud/public-cloud-report-crud.service';
import { ManageReportEventFormData } from './event-mgmt-report-crud/event-mgmt-report-crud.service';
import { ManageReportItsmFormData } from './itsm-report-crud/itsm-report-crud.service';

@Injectable()
export class ManageReportCrudService {
    private submitAnnouncedSource = new Subject<string>();
    submitAnnounced$ = this.submitAnnouncedSource.asObservable();
  
    private invalidAnnouncedSource = new Subject<string>();
    invalidAnnounced$ = this.invalidAnnouncedSource.asObservable();
  
    private errorAnnouncedSource = new Subject<any>();
    errorAnnounced$ = this.errorAnnouncedSource.asObservable();
  
    constructor(private http: HttpClient,
      private builder: FormBuilder,
      private appService: AppLevelService
    ) { }
  
    annouceSubmit() {
      this.submitAnnouncedSource.next();
    }
  
    annouceInvalid() {
      this.invalidAnnouncedSource.next();
    }
  
    announceHandleError(err: any) {
      this.errorAnnouncedSource.next(err);
    }
  
    getReportById(uuid: string) {
      return this.http.get<ManageReportFormData>(GET_REPORT_BY_ID(uuid));
    }
  
    buildForm(report: ManageReportFormData): FormGroup {
      let form = this.builder.group({
        'name': [report ? report.name : '', [Validators.required, NoWhitespaceValidator]],
        'feature': [report ? report.feature : '', [Validators.required, NoWhitespaceValidator]]
      });
      if (report) {
        form.addControl('uuid', new FormControl(report.uuid));
        form.addControl('default', new FormControl(report.default));
      }
      return form;
    }
  
    resetFormErrors(): any {
      let formErrors = {
        name: '',
        feature: ''
      };
      return formErrors;
    }
  
    validationMessages = {
      name: {
        required: 'Report name is required',
      },
      feature: {
        required: 'Module is required',
      }
    };
  
    createReport(fd: ManageReportFormData) {
      return this.http.post<ManageReportFormData>(MANAGE_CREATE_REPORT(), fd);
    }
  
    updateReport(uuid: string, fd: ManageReportFormData) {
      return this.http.put<ManageReportFormData>(UPDATE_REPORT_BY_ID(uuid), fd);
    }
  
  }
  
  export interface ManageReportFormData {
    uuid?: string;
    name: string;
    feature: string;
    default: boolean;
    report_meta: ManageReportDatacenterFormData | ManageReportPrivateCloudFormData | ManageReportPublicCloudFormData | ManageReportEventFormData | ManageReportItsmFormData;
  }  