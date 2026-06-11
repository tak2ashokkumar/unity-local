import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivityLog } from 'src/app/shared/SharedEntityTypes/activity-log.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpDashboardActivityService {

  constructor(private http: HttpClient) { }

  getActivityLogs() {
    return this.http.get<PaginatedResult<ActivityLog>>(`/customer/mtp/activity-log/`);
  }

  convertToViewdata(logs: ActivityLog[]): DashboardActivityLogViewData[] {
    let viewData: DashboardActivityLogViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    logs.map(lg => {
      let a = new DashboardActivityLogViewData();
      a.action = lg.object_repr ? `${lg.action} - ${lg.object_repr}` : lg.action;
      a.actorName = lg.actor ? `${lg.actor.first_name} ${lg.actor.last_name}` : 'NA';
      a.actorEmail = lg.actor ? lg.actor.email : '';
      a.iconByAction = this.getIconByAction(lg.action);
      // a.iconColorByAction = this.getIconByAction(lg.action);
      a.actionTime = lg.timestamp ? datePipe.transform(lg.timestamp.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }

  getIconByAction(action: string) {
    switch (action) {
      case 'Login': return `fas fa-unlock`;
      case 'Tenant Created': return `fas fa-user-plus`;
      case 'Updated': return `fas fa-pencil-alt`;
      case 'Deleted':
      case 'Tenant Deleted': return `far fa-trash-alt`;
      case 'Impersonation': return `fas fa-eye`;
      case 'Admin Ticket Created': return `fas fa-ticket-alt`;
      case 'Created': return `fas fa-plus`;
      case 'Monitoring configured': return `fas fa-chart-line`;
    }
  }
}

export class DashboardActivityLogViewData {
  action: string;
  actorName: string;
  actorEmail: string;
  actionTime: string;
  iconByAction: string;
  iconColorByAction: string;
}
