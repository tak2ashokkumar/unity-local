import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppBreadcrumbService } from '../app-breadcrumb.service';
import { Subscription } from 'rxjs';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './app-breadcrumb.component.html',
  styleUrls: ['./app-breadcrumb.component.scss']
})
export class AppBreadcrumbComponent implements OnInit, OnDestroy {

  @Input() fixed: boolean;
  private subscr: Subscription;

  public breadcrumbs = [];

  constructor(public service: AppBreadcrumbService,
    public user: UserInfoService,) { }

  public ngOnInit(): void {
    this.subscr = this.service.breadcrumbs.subscribe((params) => {
      if (params.length && params[0]) {
        for (let i = 0; i < params.length; i++) {
          let p = <{ label: string, url: string }>params[i];
          if (p.label) {
            if (this.user.selfBrandedOrgName) {
              p.label = this.getModuleNameByOrgName(p.label, this.user.selfBrandedOrgName);
            }
          }
        }
        let servicesIndexForAI = params.findIndex((p: { label: string, url: string }) => p.label == 'UPC for AI' || p.label == 'AI Agents');
        if (servicesIndexForAI > -1) {
          params.splice(servicesIndexForAI - 1, 1);
        }
      }
      this.breadcrumbs = params;
    });
  }

  getModuleNameByOrgName(moduleName: string, orgName?: string) {
    switch (moduleName) {
      case 'Unity View':
        return orgName ? `Observability` : 'Unity View';

      //Unity Cloud Related
      case 'Unity Cloud':
        return orgName ? `Cloud Management` : 'Unity Cloud';
      case 'Datacenter':
        return orgName ? `DCIM` : 'Datacenter';
      case 'Unity Connect':
        return orgName ? `UnitedConnect®` : 'Unity Connect';

      //Unity Services Related
      case 'Unity Services':
        return orgName ? `Cloud Intelligence` : 'Unity Services';
      case 'Devops Automation':
        return orgName ? `Agentic Orchestration` : 'Devops Automation';
      case 'AI Observability':
        return orgName ? `AI Performance` : 'AI Observability';
      case 'LLM':
        return orgName ? `LLM Performance` : 'LLM';
      case 'Vector DB':
        return orgName ? `Vector DB Performance` : 'Vector DB';
      case 'GPU':
        return orgName ? `GPU Performance` : 'GPU';

      //Cost Analysis Related
      case 'Cost Analysis':
        return orgName ? `FINOPS` : 'Cost Analysis';

      //Unity Reports Related
      case 'Unity Reports':
        return orgName ? `Reports` : 'Unity Reports';

      //Support Related
      case 'Support':
        return orgName ? `ITSM` : 'Support';

      //Unity Setup Related
      case 'Unity Setup':
        return orgName ? `${orgName} Administration` : 'Unity Setup';
      case 'Credentials':
        return orgName ? `Secrets Management` : 'Credentials';
      default:
        return moduleName;
    }
  }

  ngOnDestroy() {
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }
}
