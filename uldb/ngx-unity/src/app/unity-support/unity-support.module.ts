import { NgModule } from '@angular/core';

import { UnitySupportRoutingModule } from './unity-support-routing.module';
import { UnitySupportDocumentationComponent } from './unity-support-documentation/unity-support-documentation.component';
import { AppCoreModule } from '../app-core/app-core.module';
import { SharedModule } from '../shared/shared.module';
import { UserGuideComponent } from './unity-support-documentation/user-guide/user-guide.component';
import { UnityReleasesComponent } from './unity-support-documentation/unity-releases/unity-releases.component';
import { CurrentReleasesComponent } from './unity-support-documentation/unity-releases/current-releases/current-releases.component';
import { UnityArchivesComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives.component';
import { UnityPdfViewerComponent } from './unity-support-documentation/unity-pdf-viewer/unity-pdf-viewer.component';
import { UnitySupportTicketMgmtComponent } from './unity-support-ticket-mgmt/unity-support-ticket-mgmt.component';
import { AllTicketsComponent } from './unity-support-ticket-mgmt/all-tickets/all-tickets.component';
import { ChangeMgmtComponent } from './unity-support-ticket-mgmt/change-mgmt/change-mgmt.component';
import { IncidentMgmtComponent } from './unity-support-ticket-mgmt/incident-mgmt/incident-mgmt.component';
import { ServiceRequestComponent } from './unity-support-ticket-mgmt/service-request/service-request.component';
import { UnityArchivesListComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives-list/unity-archives-list.component';
import { UnityArchivesViewComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives-view/unity-archives-view.component';
import { UnitySupportMaintenanceComponent } from './unity-support-maintenance/unity-support-maintenance.component';
import { NowIncidentComponent } from './unity-support-ticket-mgmt/now-incident/now-incident.component';
import { NowProblemComponent } from './unity-support-ticket-mgmt/now-problem/now-problem.component';
import { NowChangeRequestComponent } from './unity-support-ticket-mgmt/now-change-request/now-change-request.component';
import { UnitySupportService } from './unity-support.service';
import { UnitySupportResolverService } from './unity-support-resolver.service';
import { UnitySupportFeedbackMgmtComponent } from './unity-support-feedback-mgmt/unity-support-feedback-mgmt.component';
import { UnitySupportFeedbackComponent } from './unity-support-feedback-mgmt/unity-support-feedback/unity-support-feedback.component';
import { MsDynamicsQuestionComponent } from './unity-support-ticket-mgmt/ms-dynamics-question/ms-dynamics-question.component';
import { MsDynamicsProblemComponent } from './unity-support-ticket-mgmt/ms-dynamics-problem/ms-dynamics-problem.component';
import { MsDynamicsRequestComponent } from './unity-support-ticket-mgmt/ms-dynamics-request/ms-dynamics-request.component';
import { MsDynamicsChangeComponent } from './unity-support-ticket-mgmt/ms-dynamics-change/ms-dynamics-change.component';
import { MsDynamicsIncidentComponent } from './unity-support-ticket-mgmt/ms-dynamics-incident/ms-dynamics-incident.component';
import { MsDynamicsAllComponent } from './unity-support-ticket-mgmt/ms-dynamics-all/ms-dynamics-all.component';
import { NowAllComponent } from './unity-support-ticket-mgmt/now-all/now-all.component';
import { JiraTicketsComponent } from './unity-support-ticket-mgmt/jira-tickets/jira-tickets.component';
import { UnitySupportJiraTicketMgmtComponent } from './unity-support-ticket-mgmt/unity-support-jira-ticket-mgmt/unity-support-jira-ticket-mgmt.component';
import { UnitySupportJiraTicketMgmtProjectComponent } from './unity-support-ticket-mgmt/unity-support-jira-ticket-mgmt/unity-support-jira-ticket-mgmt-project/unity-support-jira-ticket-mgmt-project.component';
import { UnitySupportScheduledMaintenanceComponent } from './unity-support-scheduled-maintenance/unity-support-scheduled-maintenance.component';
import { UnitySupportScheduledMaintenanceCrudComponent } from './unity-support-scheduled-maintenance/unity-support-scheduled-maintenance-crud/unity-support-scheduled-maintenance-crud.component';
import { UnityoneItsmTicketComponent } from './unity-support-ticket-mgmt/unityone-itsm-ticket/unityone-itsm-ticket.component';
import { UnityoneItsmTicketCrudComponent } from './unity-support-ticket-mgmt/unityone-itsm-ticket/unityone-itsm-ticket-crud/unityone-itsm-ticket-crud.component';

@NgModule({
  declarations: [UnitySupportDocumentationComponent,
    UserGuideComponent,
    UnityReleasesComponent,
    CurrentReleasesComponent,
    UnityArchivesComponent,
    UnityPdfViewerComponent,
    UnitySupportFeedbackComponent,
    UnitySupportTicketMgmtComponent,
    AllTicketsComponent,
    ChangeMgmtComponent,
    IncidentMgmtComponent,
    ServiceRequestComponent,
    UnityArchivesListComponent,
    UnityArchivesViewComponent,
    UnitySupportMaintenanceComponent,
    NowIncidentComponent,
    NowProblemComponent,
    NowChangeRequestComponent,
    UnitySupportFeedbackMgmtComponent,
    MsDynamicsQuestionComponent,
    MsDynamicsProblemComponent,
    MsDynamicsRequestComponent,
    MsDynamicsChangeComponent,
    MsDynamicsIncidentComponent,
    MsDynamicsAllComponent,
    NowAllComponent,
    JiraTicketsComponent,
    UnitySupportJiraTicketMgmtComponent,
    UnitySupportJiraTicketMgmtProjectComponent,
    UnitySupportScheduledMaintenanceComponent,
    UnitySupportScheduledMaintenanceCrudComponent,
    UnityoneItsmTicketComponent,
    UnityoneItsmTicketCrudComponent,
  ],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitySupportRoutingModule
  ],
  providers: [
    UnitySupportService,
    UnitySupportResolverService
  ]
})
export class UnitySupportModule { }
