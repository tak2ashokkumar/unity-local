import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { PermissionService } from 'src/app/shared/permissions/permission.service';
import { JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DashboardTicketMgmtService } from './dashboard-ticket-mgmt.service';
import { GET_JIRA_TICKET_TABS, GET_NOW_TICKET_TABS, GET_ZENDESK_TICKET_TABS, TicketTab } from './ticket-tabs';

@Component({
  selector: 'dashboard-ticket-mgmt',
  templateUrl: './dashboard-ticket-mgmt.component.html',
  styleUrls: ['./dashboard-ticket-mgmt.component.scss'],
  providers: [DashboardTicketMgmtService]
})
export class DashboardTicketMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ticketTabs: Array<TicketTab> = [];
  selectedTab: TicketTab = null;
  currentCriteria: SearchCriteria;
  spinner: string = 'dashboard-ticket';
  defaultType: TicketMgmtList;
  constructor(private dashTcktSvc: DashboardTicketMgmtService,
    private router: Router,
    private user: UserInfoService,
    private permissionService: PermissionService) { }

  ngOnInit() {
    this.getDefaultTcktMgmtList();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.selectedTab = this.ticketTabs[0];
    // this.currentCriteria = {
    //   sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': this.selectedTab ? this.selectedTab.ticketType : null, 'instanceId': this.defaultType.uuid }]
    // };
  }

  projects: JiraInstanceProjects;
  async getJiraProjects(instance: TicketMgmtList) {
    this.projects = await this.dashTcktSvc.getJiraProjects(instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    return this.projects.projects_selected;
  }

  getDefaultTcktMgmtList() {
    this.currentCriteria = null;
    this.dashTcktSvc.getTcktMgmtList().pipe(take(1)).subscribe(res => {
      if (!res.length) {
        return;
      }
      this.defaultType = res.find(acc => acc.default == true);
      if (!this.defaultType) {
        return;
      }

      if (this.defaultType.type == 'DynamicsCrm') {
        // this.ticketTabs = GET_MS_DYNAMICS_TICKET_TABS(this.defaultType.uuid);
        // this.selectedTab = this.ticketTabs[0]; 
        this.currentCriteria = {
          sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': this.selectedTab ? this.selectedTab.ticketType : null, 'instanceId': this.defaultType.uuid }]
        }
      } else if (this.defaultType.type == 'Jira') {
        GET_JIRA_TICKET_TABS(this.defaultType.uuid, this.getJiraProjects(this.defaultType)).then(res => {
          this.ticketTabs = res;
          this.selectedTab = this.ticketTabs[0];
          this.currentCriteria = {
            sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
            params: [
              {
                'instanceId': this.defaultType.uuid,
                'project_id': this.selectedTab ? this.selectedTab.ticketType : null,
                'serviceDeskId': this.projects?.projects_selected.find(p => p.project_id == this.selectedTab.ticketType).serviceDeskId
              }
            ]
          }
        });
      } else if (this.defaultType.type == 'ServiceNow') {
        this.ticketTabs = GET_NOW_TICKET_TABS(this.defaultType.uuid);
        this.selectedTab = this.ticketTabs[0];
        this.currentCriteria = {
          sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': this.selectedTab ? this.selectedTab.ticketType : null, 'instanceId': this.defaultType.uuid }]
        }
      } else {
        this.ticketTabs = GET_ZENDESK_TICKET_TABS(this.defaultType.uuid);
        this.selectedTab = this.ticketTabs[0];
        this.currentCriteria = {
          sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': this.selectedTab ? this.selectedTab.ticketType : null, 'instanceId': this.defaultType.uuid }]
        }
      }
    });
  }

  selectTab(tab: TicketTab) {
    this.selectedTab = tab;
    if (this.defaultType.type == 'Jira') {
      this.currentCriteria = {
        sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
        params: [
          {
            'instanceId': this.defaultType.uuid,
            'project_id': this.selectedTab.ticketType,
            'serviceDeskId': this.projects?.projects_selected.find(p => p.project_id == this.selectedTab.ticketType).serviceDeskId
          }
        ]
      }
    } else {
      this.currentCriteria = {
        sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': this.selectedTab ? this.selectedTab.ticketType : null, 'instanceId': this.defaultType.uuid }]
      };
    }
  }

  hasTicketMgmtAccess() {
    return this.permissionService.hasViewAccess(UnityModules.TICKET_MANAGEMENT);
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }
}
