import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { APM_ONBOARDING, APM_ONBOARDING_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { OnboardedApplication } from './application-onboarding.type';

@Injectable()
export class ApplicationOnboardingService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getApplications(criteria: SearchCriteria): Observable<PaginatedResult<OnboardedApplication>> {
    return this.tableSvc.getData<PaginatedResult<OnboardedApplication>>(APM_ONBOARDING(), criteria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(APM_ONBOARDING_BY_ID(String(id)));
  }

  convertToViewData(data: OnboardedApplication[]): ApplicationViewData[] {
    return data.map(a => this.convert(a));
  }

  private convert(a: OnboardedApplication): ApplicationViewData {
    const view = new ApplicationViewData();
    view.id = a.id;
    view.applicationName = a.application_name;
    view.serviceName = a.service_name;
    view.language = (a.runtime || []).join(', ');
    view.host = a.host;
    view.tags = this.formatTags(a.tags);
    view.status = a.status;
    view.statusIcon = this.getStatusIcon(a.status);
    view.statusTooltip = a.status || 'Unknown';
    view.deployedDate = a.deployed_date ? this.utilSvc.toUnityOneDateFormat(a.deployed_date) : 'NA';
    return view;
  }

  // Tags may come back as ids or as nested {tag_name} objects - handle both.
  private formatTags(tags: any[]): string {
    if (!tags || !tags.length) {
      return '';
    }
    return tags.map(t => (t && t.tag_name ? t.tag_name : t)).join(', ');
  }

  // Maps a status string to a Font Awesome icon class (green / amber / red).
  private getStatusIcon(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'active':
      case 'running':
      case 'success':
        return 'fa-check-circle text-success';
      case 'warning':
      case 'partial':
        return 'fa-exclamation-circle text-warning';
      case 'error':
      case 'failed':
        return 'fa-exclamation-triangle text-danger';
      default:
        return 'fa-circle text-muted';
    }
  }
}

export class ApplicationViewData {
  id: number;
  applicationName: string;
  serviceName: string;
  language: string;
  host: string;
  tags: string;
  status: string;
  statusIcon: string;
  statusTooltip: string;
  deployedDate: string;
}
