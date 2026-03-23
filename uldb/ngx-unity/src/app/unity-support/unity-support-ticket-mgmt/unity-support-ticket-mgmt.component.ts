import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router, ActivatedRoute, NavigationEnd, ParamMap } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { SupportTabs } from '../unity-support-resolver.service';
import { take, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'unity-support-ticket-mgmt',
  templateUrl: './unity-support-ticket-mgmt.component.html',
  styleUrls: ['./unity-support-ticket-mgmt.component.scss'],
})
export class UnitySupportTicketMgmtComponent implements OnInit, OnDestroy {
  tabItems: SupportTabs[] = [];
  tmId: string;
  subscr: Subscription;
  tabData: TabData[] = [];
  private ngUnsubscribe = new Subject();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient) {
    this.route.paramMap.subscribe((params: ParamMap) => this.tmId = params.get('tmId'));
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/support/ticketmgmt' || event.url === '/support/ticketmgmt/' + this.tmId) {
          this.route.data.pipe(take(1)).subscribe((data: { tabItems: SupportTabs[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length) {
              if (this.tmId === null) {
                let tName: string;
                switch (this.tabItems[0].type) {
                  case 'ServiceNow': tName = serviceNowTabData[0].url; break;
                  case 'DynamicsCrm': tName = MSDynamicsTabData[0].url; break;
                  case 'Jira': tName = 'jira'; break;
                  // case 'UnityOne ITSM':
                  //   this.getITSMTabsAndNavigate('/support/ticketmgmt/a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42');
                  //   return;
                  default: tName = MSDynamicsTabData[0].url; break;
                }
                this.router.navigate([this.tabItems[0].url, tName]);
              } else {
                let tName: string;
                switch (this.getActiveTab(this.tmId).type) {
                  case 'ServiceNow':
                    tName = serviceNowTabData[0].url;
                    break;
                  case 'DynamicsCrm': tName = MSDynamicsTabData[0].url; break;
                  case 'Jira': tName = 'jira'; break;
                  // case 'UnityOne ITSM':
                  //   this.getITSMTabsAndNavigate('/support/ticketmgmt/a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42');
                  //   break;
                  default: tName = MSDynamicsTabData[0].url; break;
                }
                this.router.navigate(['/support/ticketmgmt/', this.tmId, tName]);
              }
            }
          });
        } else {
          this.tabData = [];
          this.route.data.subscribe((data: { tabItems: SupportTabs[] }) => {
            this.tabItems = data.tabItems;
            let td: TabData[];
            switch (this.getActiveTab(this.tmId).type) {
              case 'ServiceNow': td = serviceNowTabData; break;
              case 'DynamicsCrm': td = MSDynamicsTabData; break;
              case 'Jira': td = []; break;
              case 'UnityOne ITSM':
                this.getITSMTabsAndNavigate('/support/ticketmgmt/a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42'); //need to revisit this part.
                break;
              default: td = MSDynamicsTabData; break;
            }
            this.tabData = td;
          });
        }
      }
    });
  }

  getITSMTabsAndNavigate(baseUrl?: string) {
    this.http.get<any>('/rest/unity_itsm/tables/').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res?.results?.length) {
        this.tabData = res.results.map(r => ({
          name: r.name,
          url: ['unityone-itsm', r.uuid]
        }));

        const alreadyOnItsmTable = this.router.url.includes('/unityone-itsm/');
        if (alreadyOnItsmTable) {
          // Do NOT redirect again
          return;
        }
        const firstTableUrl = this.tabData[0].url;
        this.router.navigate([baseUrl, ...firstTableUrl]);
      }
    });
  }

  getActiveTab(tmId: string) {
    return this.tabItems.filter(tab => tab.uuid == tmId).getFirst();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

  goTo(tab: TabData) {
    if (tab.url[0] === 'unityone-itsm') {
      const tableUuid = tab.url[1];
      this.router.navigate(['/support/ticketmgmt/a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42/unityone-itsm/', tableUuid]); // given hardcoded value because we don't have uuid for unityone-itsm so keep it random id
      return;
    } else {
      this.router.navigate(['/support/ticketmgmt/', this.tmId, tab.url]);
    }
  }

  isActive(tab: TabData) {
    if (tab.url[0] === 'unityone-itsm') {
      const tableUuid = tab.url[1];
      if (this.router.url.match('/support/ticketmgmt/a9f2d1b7-3e4c-4f8a-9c2b-6e5d1a7c0b42/unityone-itsm/' + tableUuid)) // given hardcoded value because we don't have uuid for unityone-itsm so keep it random id
        return 'active text-success';
    } else {
      if (this.router.url.match('/support/ticketmgmt/' + this.tmId + '/' + tab.url)) {
        return 'active text-success';
      }
    }
  }
}

const zendeskTabData: TabData[] = [
  {
    name: 'All Tickets',
    url: 'alltickets'
  },
  {
    name: 'Change Management',
    url: 'changetickets'
  },
  {
    name: 'Incident Management',
    url: 'existingtickets'
  },
  {
    name: 'Service Request',
    url: 'servicerequests'
  }
];

const serviceNowTabData: TabData[] = [
  {
    name: 'All tickets',
    url: 'nowtickets'
  },
  {
    name: 'Change Request',
    url: 'nowchange'
  },
  {
    name: 'Incident',
    url: 'nowincident'
  },
  {
    name: 'Problem',
    url: 'nowproblem'
  }
];

const MSDynamicsTabData: TabData[] = [
  {
    name: 'All tickets',
    url: 'dynamics-crm-tickets'
  },
  // {
  //   name: 'Change',
  //   url: 'dynamics-crm-changes'
  // },
  // {
  //   name: 'Incident',
  //   url: 'dynamics-crm-incidents'
  // },
  // {
  //   name: 'Problem',
  //   url: 'dynamics-crm-problems'
  // },
  // {
  //   name: 'Question',
  //   url: 'dynamics-crm-questions'
  // },
  // {
  //   name: 'Request',
  //   url: 'dynamics-crm-requests'
  // }
];