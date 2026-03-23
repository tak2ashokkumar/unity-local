import { catchError } from 'rxjs/operators';
import { JiraInstanceProject, JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';
import { TICKET_TYPE, SERVICE_NOW_TICKET_TYPE, MS_DYNAMICS_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

export interface TicketTab {
    title?: string;
    ticketType?: string;
    drillDownLink: string;
}
const zendeskTicketTabs = (uuid: string) => {
    return [
        {
            title: 'Change Management',
            ticketType: TICKET_TYPE.TASK,
            drillDownLink: `/support/ticketmgmt/${uuid}/changetickets`
        },
        {
            title: 'Incident Management',
            ticketType: TICKET_TYPE.INCIDENT,
            drillDownLink: `/support/ticketmgmt/${uuid}/existingtickets`
        },
        {
            title: 'Service Request',
            ticketType: TICKET_TYPE.PROBLEM,
            drillDownLink: `/support/ticketmgmt/${uuid}/servicerequests`
        }
    ]
}

export const GET_ZENDESK_TICKET_TABS = (uuid: string) => {
    return zendeskTicketTabs(uuid);
}

const nowTicketTabs = (uuid: string) => {
    return [
        {
            title: 'Change Requests',
            ticketType: SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST,
            drillDownLink: `/support/ticketmgmt/${uuid}/nowchange`
        },
        {
            title: 'Incidents',
            ticketType: SERVICE_NOW_TICKET_TYPE.INCIDENT,
            drillDownLink: `/support/ticketmgmt/${uuid}/nowincident`
        },
        {
            title: 'Problem',
            ticketType: SERVICE_NOW_TICKET_TYPE.PROBLEM,
            drillDownLink: `/support/ticketmgmt/${uuid}/nowproblem`
        }
    ]
}

export const GET_NOW_TICKET_TABS = (uuid: string) => {
    return nowTicketTabs(uuid);
}

const MSDynamicsTicketTabs = (uuid: string) => {
    return [
        {
            title: 'All Tickets',
            ticketType: null,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-tickets`
        },
        {
            title: 'Change',
            ticketType: MS_DYNAMICS_TICKET_TYPE.CHANGE,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-changes`
        },
        {
            title: 'Incident',
            ticketType: MS_DYNAMICS_TICKET_TYPE.INCIDENT,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-incidents`
        },
        {
            title: 'Problem',
            ticketType: MS_DYNAMICS_TICKET_TYPE.PROBLEM,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-problems`
        },
        {
            title: 'Question',
            ticketType: MS_DYNAMICS_TICKET_TYPE.QUESTION,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-questions`
        },
        {
            title: 'Request',
            ticketType: MS_DYNAMICS_TICKET_TYPE.REQUEST,
            drillDownLink: `/support/ticketmgmt/${uuid}/dynamics-crm-requests`
        }
    ]
}

export const GET_MS_DYNAMICS_TICKET_TABS = (uuid: string) => {
    return MSDynamicsTicketTabs(uuid);
}

export const GET_JIRA_TICKET_TABS = (uuid: string, projects: Promise<JiraInstanceProject[]>) => {
    let JiraTicketTabs: TicketTab[] = [];
    return projects.then(pjs => {
        pjs.forEach(p => {
            let obj = {
                title: p.project_name,
                ticketType: p.project_id,
                drillDownLink: `/support/ticketmgmt/${uuid}/jira/projects/${p.project_id}`
            }
            JiraTicketTabs.push(obj)
        })
        return JiraTicketTabs;
    }).catch(() => {
        return JiraTicketTabs;
    });
}