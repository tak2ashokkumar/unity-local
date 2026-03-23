import { Component, inject, Inject, Injectable, OnInit, Renderer2 } from '@angular/core';
import { UserInfoService } from './shared/user-info.service';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { AppLevelService } from './app-level.service';
import { AppInjector } from './app.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private userInfoSvc: UserInfoService,
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    // setTimeout(() => {
    //   if (this.userInfoSvc.isReadonlyUser) {
    //     this.renderer.addClass(this.document.body, 'read-only');
    //   }
    // }, 100);

    // this.router.events.subscribe((event: Event) => {
    //   if (event instanceof NavigationEnd) {
    //     setInterval(() => {
    //       let actionIcons = document.getElementsByClassName('action-icons');
    //       for (let i = 0; i < actionIcons.length; i++) {
    //         let elem = actionIcons.item(i);
    //         let isExcludedElem = elem.className.includes('reset-action-icon')
    //           || elem.className.includes('fa-info-circle')
    //           || elem.className.includes('fa-caret-down')
    //           || elem.className.includes('fa-caret-up');
    //         if (this.userInfoSvc.isReadonlyUser && !isExcludedElem) {
    //           this.renderer.setAttribute(elem, 'disabled', 'true');
    //           this.renderer.addClass(elem, 'action-icons-disabled');
    //           this.renderer.setStyle(elem, 'cursor', 'none');
    //         }
    //       }

    //       let pointerLinks = document.getElementsByClassName('pointer-link');
    //       for (let i = 0; i < pointerLinks.length; i++) {
    //         let elem = pointerLinks.item(i);
    //         let enableDisabledBtn = (elem.nodeName == 'LABEL' && elem.childNodes[0].nodeName == 'INPUT');
    //         let otherEffectedItem = elem.innerHTML == 'click here' ||
    //           elem.innerHTML == 'Click here' || elem.innerHTML == 'Click Here';
    //         if (this.userInfoSvc.isReadonlyUser) {
    //           if (enableDisabledBtn) {
    //             this.renderer.setStyle(elem, 'pointer-events', 'none');
    //             this.renderer.setStyle(elem, 'cursor', 'none');
    //             this.renderer.setStyle(elem.parentNode, 'cursor', 'none');
    //             elem.childNodes.forEach(chn => {
    //               this.renderer.setStyle(chn, 'cursor', 'none');
    //             })
    //           }
    //           if (otherEffectedItem) {
    //             this.renderer.setStyle(elem, 'pointer-events', 'none');
    //             this.renderer.setStyle(elem, 'cursor', 'none');
    //           }
    //         }
    //       }
    //     }, 1000)
    //   }
    // });
  }
}


export class UnityPermissionSet {
  private module: UnityModules;
  private appLevelSvc: any;
  subTaskView?: boolean;
  subTaskManage?: boolean;
  constructor(module: UnityModules) {
    this.module = module;
    this.appLevelSvc = AppInjector.get(AppLevelService);
  }

  get modulePermissionSet() {
    if (this.module) {
      let modulePerms = this.appLevelSvc.getAccess(this.module);
      return modulePerms;
    } else {
      return [];
    }
  }

  get moduleViewPermission() {
    return this.module == UnityModules.TICKET_MANAGEMENT ? `View Tickets` :
      this.module == UnityModules.USER_MANAGEMENT ? `View Users` : `View ${this.module}`;
  }

  get moduleManagePermission() {
    return this.module == UnityModules.TICKET_MANAGEMENT ? `Manage Tickets` :
      this.module == UnityModules.USER_MANAGEMENT ? `Manage Users` : `Manage ${this.module}`;
  }

  get view() {
    if (this.module && this.modulePermissionSet) {
      return this.modulePermissionSet.includes(this.moduleViewPermission);
    } else {
      return false;
    }
  }

  get manage() {
    if (this.module && this.modulePermissionSet) {
      return this.modulePermissionSet.includes(this.moduleManagePermission);
    } else {
      return false;
    }
  }

  set subTaskViewPermission(task: string) {
    if (this.module && this.modulePermissionSet) {
      if (task == 'Order Catalog') {
        this.subTaskView = this.modulePermissionSet.includes(`${task}`);
      } else {
        let exists = this.modulePermissionSet.find(mp => mp.trim() == `View ${task}`.trim());
        this.subTaskView = exists ? true : false;
      }
    } else {
      this.subTaskView = false;
    }
  }

  set subTaskManagePermission(task: string) {
    if (this.module && this.modulePermissionSet) {
      if (task == 'Order Catalog') {
        this.subTaskManage = this.modulePermissionSet.includes(`${task}`);
      } else {
        let exists = this.modulePermissionSet.find(mp => mp.trim() == `Manage ${task}`.trim());
        this.subTaskManage = exists ? true : false;
      }
    } else {
      this.subTaskManage = false;
    }
  }
}

export enum UnityModules {
  DASHBOARD = 'Dashboard',
  MONITORING = 'Monitoring',
  ACTIVITY_LOG = 'Activity Log',
  NETWORK_TOPOLOGY = 'Network Topology',
  SERVICE_TOPOLOGY = 'Service Topology',

  PRIVATE_CLOUD = 'Private Cloud',
  PUBLIC_CLOUD = 'Public Cloud',
  DATACENTER = 'Datacenter',
  SERVICES = 'Services',
  UNITY_CONNECT = 'UnityConnect',

  AIML_EVENT_MANAGEMENT = 'AIML Event Management',
  DEVOPS_AUTOMATION = 'DevOps Automation',
  SERVICE_CATALOGUE = 'Service Catalog',
  SUSTAINABILITY = 'Sustainability',

  COST_ANALYSIS = 'Cost Analysis',

  UNITY_REPORT = 'Unity Report',

  TICKET_MANAGEMENT = 'Ticket Management',
  MAINTENENCE = 'Maintenance',

  UNITY_SETUP = 'UnitySetup',
  USER_MANAGEMENT = 'User Management',
  ONBOARDING = 'Onboarding',
  UNITY_COLLECTOR = 'UnityCollector',
  CREDENTIALS = 'Credentials',
  INTEGRATIONS = 'Integrations',
  NOTIFICATIONS = 'Notifications',
  NCM = 'Network Configuration',
  COST_PLAN = 'Cost Plan',
  BUDGET = 'Budget',
  POLICY = 'Policy',
  CONNECTIONS = 'Connections',
  CUSTOM_ATTRIBUTES = 'Custom Attributes',
  FINOPS = 'FinOps',
  QUERY_STATISTICS = 'Query Statistics'
}
