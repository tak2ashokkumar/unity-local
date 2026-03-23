import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { MS_DYNAMICS_TICKET_TYPE, SERVICE_NOW_TICKET_TYPE } from '../shared/app-utility/app-utility.service';
import { JiraTicketDetailsComponent } from '../shared/shared-jira-tckt-mgmt/jira-ticket-details/jira-ticket-details.component';
import { MsDynamicsTcktDetailsComponent } from '../shared/shared-ms-dynamics-tckt-mgmt/ms-dynamics-tckt-details/ms-dynamics-tckt-details.component';
import { NowTicketDetailsComponent } from '../shared/shared-service-now-mgmt/now-ticket-details/now-ticket-details.component';
import { TicketDetailsComponent } from '../shared/shared-tckt-mgmt/ticket-details/ticket-details.component';
import { JiraGuard } from './jira.guard';
import { MsDynamicsCrmGuard } from './ms-dynamics-crm.guard';
import { ServiceNowGuard } from './service-now.guard';
import { CurrentReleasesComponent } from './unity-support-documentation/unity-releases/current-releases/current-releases.component';
import { UnityArchivesListComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives-list/unity-archives-list.component';
import { UnityArchivesViewComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives-view/unity-archives-view.component';
import { UnityArchivesComponent } from './unity-support-documentation/unity-releases/unity-archives/unity-archives.component';
import { UnityReleasesComponent } from './unity-support-documentation/unity-releases/unity-releases.component';
import { UnitySupportDocumentationComponent } from './unity-support-documentation/unity-support-documentation.component';
import { UserGuideComponent } from './unity-support-documentation/user-guide/user-guide.component';
import { UnitySupportFeedbackMgmtComponent } from './unity-support-feedback-mgmt/unity-support-feedback-mgmt.component';
import { UnitySupportFeedbackComponent } from './unity-support-feedback-mgmt/unity-support-feedback/unity-support-feedback.component';
import { UnitySupportMaintenanceComponent } from './unity-support-maintenance/unity-support-maintenance.component';
import { UnitySupportResolverService } from './unity-support-resolver.service';
import { AllTicketsComponent } from './unity-support-ticket-mgmt/all-tickets/all-tickets.component';
import { ChangeMgmtComponent } from './unity-support-ticket-mgmt/change-mgmt/change-mgmt.component';
import { IncidentMgmtComponent } from './unity-support-ticket-mgmt/incident-mgmt/incident-mgmt.component';
import { JiraTicketsComponent } from './unity-support-ticket-mgmt/jira-tickets/jira-tickets.component';
import { MsDynamicsAllComponent } from './unity-support-ticket-mgmt/ms-dynamics-all/ms-dynamics-all.component';
import { MsDynamicsChangeComponent } from './unity-support-ticket-mgmt/ms-dynamics-change/ms-dynamics-change.component';
import { MsDynamicsIncidentComponent } from './unity-support-ticket-mgmt/ms-dynamics-incident/ms-dynamics-incident.component';
import { MsDynamicsProblemComponent } from './unity-support-ticket-mgmt/ms-dynamics-problem/ms-dynamics-problem.component';
import { MsDynamicsQuestionComponent } from './unity-support-ticket-mgmt/ms-dynamics-question/ms-dynamics-question.component';
import { MsDynamicsRequestComponent } from './unity-support-ticket-mgmt/ms-dynamics-request/ms-dynamics-request.component';
import { NowAllComponent } from './unity-support-ticket-mgmt/now-all/now-all.component';
import { NowChangeRequestComponent } from './unity-support-ticket-mgmt/now-change-request/now-change-request.component';
import { NowIncidentComponent } from './unity-support-ticket-mgmt/now-incident/now-incident.component';
import { NowProblemComponent } from './unity-support-ticket-mgmt/now-problem/now-problem.component';
import { ServiceRequestComponent } from './unity-support-ticket-mgmt/service-request/service-request.component';
import { UnitySupportJiraTicketMgmtProjectComponent } from './unity-support-ticket-mgmt/unity-support-jira-ticket-mgmt/unity-support-jira-ticket-mgmt-project/unity-support-jira-ticket-mgmt-project.component';
import { UnitySupportJiraTicketMgmtComponent } from './unity-support-ticket-mgmt/unity-support-jira-ticket-mgmt/unity-support-jira-ticket-mgmt.component';
import { UnitySupportTicketMgmtComponent } from './unity-support-ticket-mgmt/unity-support-ticket-mgmt.component';
import { ZendeskGuard } from './zendesk.guard';
import { UnitySupportScheduledMaintenanceCrudComponent } from './unity-support-scheduled-maintenance/unity-support-scheduled-maintenance-crud/unity-support-scheduled-maintenance-crud.component';
import { NowEnhancedTicketDetailsComponent } from '../shared/shared-service-now-mgmt/now-enhanced-ticket-details/now-enhanced-ticket-details.component';
import { UnityoneItsmTicketComponent } from './unity-support-ticket-mgmt/unityone-itsm-ticket/unityone-itsm-ticket.component';
import { UnityoneItsmTicketCrudComponent } from './unity-support-ticket-mgmt/unityone-itsm-ticket/unityone-itsm-ticket-crud/unityone-itsm-ticket-crud.component';

const detailsConst: Route = {
  path: ':ticketId/details',
  component: TicketDetailsComponent,
  data: {
    breadcrumb: {
      title: 'Details'
    }
  },
  canActivate: [ZendeskGuard]
}

const ServiceNowDetailsConst: Route = {
  path: ':ticketId/details',
  component: NowTicketDetailsComponent,
  data: {
    breadcrumb: {
      title: 'Details'
    }
  },
  canActivate: [ServiceNowGuard]
}

const ServiceNowEnhancedDetailsConst: Route = {
  path: ':ticketId/enhanced-details',
  component: NowEnhancedTicketDetailsComponent,
  data: {
    breadcrumb: {
      title: 'Details'
    }
  },
  canActivate: [ServiceNowGuard]
}

const MSDynamicsTicketDetailsConst: Route = {
  path: ':ticketId/details',
  component: MsDynamicsTcktDetailsComponent,
  data: {
    breadcrumb: {
      title: 'Details'
    }
  },
  canActivate: [MsDynamicsCrmGuard]
}

const JiraTicketDetailsConst: Route = {
  path: ':ticketId/details',
  component: JiraTicketDetailsComponent,
  data: {
    breadcrumb: {
      title: 'Details'
    }
  },
  canActivate: [JiraGuard]
}

const routes: Routes = [
  {
    path: 'feedback',
    component: UnitySupportFeedbackMgmtComponent,
    data: {
      breadcrumb: {
        title: 'Feedback'
      }
    },
    children: [
      {
        path: '',
        component: UnitySupportFeedbackComponent,
        data: {
          breadcrumb: {
            title: ''
          }
        }
      },
      {
        path: ':ticketId/details',
        component: MsDynamicsTcktDetailsComponent,
        data: {
          breadcrumb: {
            title: 'Details'
          }
        }
      }
    ]
  },
  {
    path: 'ticketmgmt',
    component: UnitySupportTicketMgmtComponent,
    resolve: {
      tabItems: UnitySupportResolverService
    },
    data: {
      breadcrumb: {
        title: 'Ticket Management'
      }
    }
  },
  {
    path: 'ticketmgmt/:tmId',
    component: UnitySupportTicketMgmtComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      tabItems: UnitySupportResolverService
    },
    data: {
      breadcrumb: {
        title: 'Ticket Management'
      }
    },
    children: [
      {
        path: 'unityone-itsm/:tableUuid',
        component: UnityoneItsmTicketComponent,
        data: {
          breadcrumb: {
            title: 'Details'
          }
        }
      },
      {
        path: 'unityone-itsm/:tableUuid/create',
        component: UnityoneItsmTicketCrudComponent,
        data: {
          breadcrumb: {
            title: 'Create'
          }
        }
      },
      {
        path: 'unityone-itsm/:tableUuid/:recordUuid/edit',
        component: UnityoneItsmTicketCrudComponent,
        data: {
          breadcrumb: {
            title: 'Update'
          }
        }
      },
      {
        path: 'alltickets',
        component: AllTicketsComponent,
        data: {
          breadcrumb: {
            title: 'All Tickets'
          }
        },
        canActivate: [ZendeskGuard]
      },
      {
        path: 'alltickets',
        data: {
          breadcrumb: {
            title: 'All Tickets'
          }
        },
        children: [
          detailsConst
        ]
      },
      {
        path: 'changetickets',
        component: ChangeMgmtComponent,
        data: {
          breadcrumb: {
            title: 'Change Tickets'
          }
        },
        canActivate: [ZendeskGuard]
      },
      {
        path: 'changetickets',
        data: {
          breadcrumb: {
            title: 'Change Tickets'
          }
        },
        children: [
          detailsConst
        ]
      },
      {
        path: 'existingtickets',
        component: IncidentMgmtComponent,
        data: {
          breadcrumb: {
            title: 'Incident Tickets'
          }
        },
        canActivate: [ZendeskGuard]
      },
      {
        path: 'existingtickets',
        data: {
          breadcrumb: {
            title: 'Incident Tickets'
          }
        },
        children: [
          detailsConst
        ]
      },
      {
        path: 'servicerequests',
        component: ServiceRequestComponent,
        data: {
          breadcrumb: {
            title: 'Service Requests'
          }
        },
        canActivate: [ZendeskGuard]
      },
      {
        path: 'servicerequests',
        data: {
          breadcrumb: {
            title: 'Service Requests'
          }
        },
        children: [
          detailsConst
        ]
      },
      {
        path: 'nowtickets',
        component: NowAllComponent,
        data: {
          breadcrumb: {
            title: 'All Tickets'
          }
        },
        canActivate: [ServiceNowGuard]
      },
      {
        path: 'nowtickets',
        data: {
          breadcrumb: {
            title: 'All Tickets'
          },
        },
        children: [
          ServiceNowDetailsConst,
          ServiceNowEnhancedDetailsConst
        ]
      },
      {
        path: 'nowchange',
        component: NowChangeRequestComponent,
        data: {
          breadcrumb: {
            title: 'Change Requests'
          }
        },
        canActivate: [ServiceNowGuard]
      },
      {
        path: 'nowchange',
        data: {
          breadcrumb: {
            title: 'Change Requests'
          },
          type: SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST
        },
        children: [
          ServiceNowDetailsConst
        ]
      },
      {
        path: 'nowincident',
        component: NowIncidentComponent,
        data: {
          breadcrumb: {
            title: 'Incidents'
          }
        },
        canActivate: [ServiceNowGuard]
      },
      {
        path: 'nowincident',
        data: {
          breadcrumb: {
            title: 'Incidents'
          },
          // type: SERVICE_NOW_TICKET_TYPE.INCIDENT
        },
        children: [
          ServiceNowEnhancedDetailsConst
        ]
      },
      {
        path: 'nowproblem',
        component: NowProblemComponent,
        data: {
          breadcrumb: {
            title: 'Problem'
          }
        },
        canActivate: [ServiceNowGuard]
      },
      {
        path: 'nowproblem',
        data: {
          breadcrumb: {
            title: 'Problem'
          },
          // type: SERVICE_NOW_TICKET_TYPE.PROBLEM
        },
        children: [
          ServiceNowEnhancedDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-tickets',
        component: MsDynamicsAllComponent,
        data: {
          breadcrumb: {
            title: 'All Tickets'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-tickets',
        data: {
          breadcrumb: {
            title: 'All Tickets'
          },
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-changes',
        component: MsDynamicsChangeComponent,
        data: {
          breadcrumb: {
            title: 'Changes'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-changes',
        data: {
          breadcrumb: {
            title: 'Changes'
          },
          type: MS_DYNAMICS_TICKET_TYPE.CHANGE
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-incidents',
        component: MsDynamicsIncidentComponent,
        data: {
          breadcrumb: {
            title: 'Incident'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-incidents',
        data: {
          breadcrumb: {
            title: 'Incident'
          },
          type: MS_DYNAMICS_TICKET_TYPE.INCIDENT
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-problems',
        component: MsDynamicsProblemComponent,
        data: {
          breadcrumb: {
            title: 'Problem'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-problems',
        data: {
          breadcrumb: {
            title: 'Problem'
          },
          type: MS_DYNAMICS_TICKET_TYPE.PROBLEM
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-questions',
        component: MsDynamicsQuestionComponent,
        data: {
          breadcrumb: {
            title: 'Question'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-questions',
        data: {
          breadcrumb: {
            title: 'Question'
          },
          type: MS_DYNAMICS_TICKET_TYPE.QUESTION
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'dynamics-crm-requests',
        component: MsDynamicsRequestComponent,
        data: {
          breadcrumb: {
            title: 'Request'
          }
        },
        canActivate: [MsDynamicsCrmGuard]
      },
      {
        path: 'dynamics-crm-requests',
        data: {
          breadcrumb: {
            title: 'Request'
          },
          type: MS_DYNAMICS_TICKET_TYPE.REQUEST
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
      {
        path: 'jira',
        component: UnitySupportJiraTicketMgmtComponent,
        data: {
          breadcrumb: {
            title: 'Jira'
          }
        },
        canActivate: [JiraGuard],
        children: [
          {
            path: 'projects/:projectId',
            component: UnitySupportJiraTicketMgmtProjectComponent,
            data: {
              breadcrumb: {
                title: 'Tickets'
              }
            },
            canActivate: [JiraGuard]
          },
          {
            path: 'projects/:projectId',
            data: {
              breadcrumb: {
                title: 'Tickets'
              }
            },
            children: [
              JiraTicketDetailsConst
            ]
          },
        ]
      },

      {
        path: 'jira-tickets',
        component: JiraTicketsComponent,
        data: {
          breadcrumb: {
            title: 'Jira Tickets'
          }
        },
        canActivate: [JiraGuard]
      },
      {
        path: 'jira-tickets/:projectId',
        component: JiraTicketsComponent,
        data: {
          breadcrumb: {
            title: 'Jira Tickets'
          }
        },
        children: [
          MSDynamicsTicketDetailsConst
        ]
      },
    ]
  },
  {
    path: 'documentation',
    component: UnitySupportDocumentationComponent,
    data: {
      breadcrumb: {
        title: 'Documentation'
      }
    },
    children: [
      {
        path: 'userguide',
        component: UserGuideComponent,
        data: {
          breadcrumb: {
            title: 'User Guide'
          }
        },
      },
      {
        path: 'releases',
        component: UnityReleasesComponent,
        data: {
          breadcrumb: {
            title: 'Releases'
          }
        },
        children: [
          {
            path: 'current',
            component: CurrentReleasesComponent,
            data: {
              breadcrumb: {
                title: 'Current Release'
              }
            },
          },
          {
            path: 'archives',
            component: UnityArchivesComponent,
            data: {
              breadcrumb: {
                title: 'Previous Releases'
              }
            },
            children: [
              {
                path: 'list',
                component: UnityArchivesListComponent
              },
              {
                path: 'view',
                component: UnityArchivesViewComponent
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'maintenance',
    component: UnitySupportMaintenanceComponent,
    data: {
      breadcrumb: {
        title: 'Maintenance'
      }
    }
  },
  {
    path: 'maintenance/create',
    component: UnitySupportScheduledMaintenanceCrudComponent,
    data: {
      breadcrumb: {
        title: 'Maintenance'
      }
    }
  },
  {
    path: 'maintenance/:smId/edit',
    component: UnitySupportScheduledMaintenanceCrudComponent,
    data: {
      breadcrumb: {
        title: 'Maintenance'
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitySupportRoutingModule { }
