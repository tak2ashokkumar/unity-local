import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AutoTicketingSettings } from 'src/app/shared/SharedEntityTypes/mtp-settings.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { OrgTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class MtpAdministrationAutoTicketService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,) { }

  getAutoTicketingSettings(criteria: SearchCriteria): Observable<PaginatedResult<AutoTicketingSettings>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AutoTicketingSettings>>(`/customer/mtp/tenants_settings/get_tenants_settings/`, { params: params });
  }

  convertToViewData(data: AutoTicketingSettings[]): AutoTicketingSettingsViewData[] {
    let viewData: AutoTicketingSettingsViewData[] = [];
    data.map(d => {
      viewData.push(this.convertToEachRecordViewData(d));
    })
    return viewData;
  }

  convertToEachRecordViewData(d: AutoTicketingSettings): AutoTicketingSettingsViewData {
    let a = new AutoTicketingSettingsViewData();
    a.tanantId = d.organization_uuid;
    a.tanantName = d.organization_name;
    a.isEnabled = d.auto_ticketing_enabled;
    a.settings = d;
    return a;
  }

  getTicketInstances(d: AutoTicketingSettingsViewData) {
    let params: HttpParams = new HttpParams();
    params = params.append('uuid', d.tanantId);
    return this.http.get(`/customer/mtp/mtp_ticket_accounts/`, { headers: Handle404Header, params: params })
      .pipe(
        map((res: any[]) => {
          if (res) {
            d.ticketInstances = res;
          }
          return d;
        })
      );
  }

  buildForm(d: AutoTicketingSettingsViewData): FormGroup {
    return this.builder.group({
      'id': [d.settings.id],
      'uuid': [d.settings.uuid],
      'organization': [d.settings.organization],
      'organization_uuid': [d.settings.organization_uuid],
      'organization_name': [d.settings.organization_name],
      'auto_ticketing_enabled': [d.settings.auto_ticketing_enabled],
      'auto_remediation_enabled': [d.settings.auto_remediation_enabled],
      'object_id': [d.settings.object_id],
      'ticketing_instance': [{ value: d.settings.ticketing_instance ? d.settings.ticketing_instance.uuid : null, disabled: !d.settings.auto_ticketing_enabled }, [Validators.required]],
      'auto_ticketing_severity': [{ value: d.settings.auto_ticketing_severity ? d.settings.auto_ticketing_severity : ["critical", "warning", "information"], disabled: !d.settings.auto_ticketing_enabled }, [Validators.required]],
      'auto_ticketing_delay': [{ value: d.settings.auto_ticketing_delay, disabled: !d.settings.auto_ticketing_enabled }, [Validators.required, Validators.pattern('^[0-9]*$')]],
      'content_type': [d.settings.content_type]
    });
  }

  resetFormErrors() {
    return {
      'ticketing_instance': '',
      'auto_ticketing_severity': '',
      'auto_ticketing_delay': '',
    }
  }

  formValidationMessages = {
    'ticketing_instance': {
      'required': 'ITSM Instance is required'
    },
    'auto_ticketing_severity': {
      'required': 'Severity is required',
    },
    'auto_ticketing_delay': {
      'pattern': 'Only a positive number is allowed',
      'required': 'Delay is required'
    }
  }



  saveSettings(settings: AutoTicketingSettings) {
    return this.http.put<any>(`/customer/mtp/tenants_settings/${settings.uuid}/`, settings);
  }

  getAutoTicketingSettingsByTenant(tenantId: string): Observable<any> {
    return this.http.get<any>(`/customer/mtp/tenants_settings/${tenantId}/`);
  }
}

export class AutoTicketingSettingsViewData {
  tanantId: string;
  tanantName: string;
  isSelected: boolean;
  isEnabled: boolean;
  settings: AutoTicketingSettings;
  form: FormGroup;
  ticketInstances: OrgTicketInstance[] = [];
}
