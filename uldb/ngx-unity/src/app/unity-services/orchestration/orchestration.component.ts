import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';

@Component({
  selector: 'orchestration',
  templateUrl: './orchestration.component.html',
  styleUrls: ['./orchestration.component.scss']
})
export class OrchestrationComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = [];
  subscr: Subscription;
  categoryId: string = '';

  constructor(private router: Router,
    private permissionService: PermissionService) {
    this.subscr = this.router.events.subscribe(event => {
      this.updateCategoryId(this.router.url);
      this.setTabItems();
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/orchestration') {
          if (this.tabItems.length) {
            this.router.navigate([this.tabItems[0]?.url]);
          }
        }
      }
    });
  }

  updateCategoryId(url: string) {
    const match = url.match(/\/services\/orchestration\/tasks\/([^\/]+)/);
    this.categoryId = match ? match[1] : '';
  }

  setTabItems() {
    let tabItems: TabData[] = [];
    let modulePermSet = this.permissionService.getPermissionSet(UnityModules.DEVOPS_AUTOMATION);
    tabData.forEach(td => {
      if (td.task) {
        let taskArr: string[] = td.task.split('|');
        let showTab: boolean = false;
        for (let i = 0; i < taskArr.length; i++) {
          if (td.permission == 'Manage') {
            modulePermSet.subTaskManagePermission = taskArr[i];
            if (modulePermSet.subTaskManage) {
              showTab = true;
              break;
            }
          } else {
            modulePermSet.subTaskViewPermission = <string>taskArr[i];
            if (modulePermSet.subTaskView) {
              showTab = true;
              break;
            }
          }
        }
        if (showTab) {
          tabItems.push(this.getDynamicTab(td));
        }
      } else {
        tabItems.push(td);
      }
    })
    this.tabItems = tabItems;
  }

  getDynamicTab(tab: TabData): TabData {
    if (tab.name === 'Tasks') {
      return {
        ...tab,
        url: this.categoryId ? `/services/orchestration/tasks/${this.categoryId}` : `/services/orchestration/tasks`
      };
    }
    return tab;
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }
}

const tabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/orchestration/summary',
    task: 'Tasks | Workflow',
    permission: 'View'
  },
  {
    name: 'Tasks',
    url: '/services/orchestration/tasks/:categoryId',
    task: 'Tasks',
    permission: 'View'
  },
  {
    name: 'Workflows',
    url: '/services/orchestration/workflows',
    task: 'Workflow',
    permission: 'View'
  },
  {
    name: 'Executions',
    url: '/services/orchestration/executions',
    task: 'DevOps Automation',
    permission: 'View'
  },
  {
    name: 'Input Template',
    url: '/services/orchestration/input-template',
    task: 'DevOps Automation',
    permission: 'View'
  },
  {
    name: 'Image Mapping',
    url: '/services/orchestration/image-mapping',
    task: 'DevOps Automation',
    permission: 'View'
  },
  {
    name: 'Integration',
    url: '/services/orchestration/integration'
  }
];
