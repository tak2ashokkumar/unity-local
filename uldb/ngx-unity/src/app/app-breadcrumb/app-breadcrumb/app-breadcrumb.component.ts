import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppBreadcrumbService } from '../app-breadcrumb.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserInfoService } from 'src/app/shared/user-info.service';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './app-breadcrumb.component.html',
  styleUrls: ['./app-breadcrumb.component.scss']
})
export class AppBreadcrumbComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  public breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    public service: AppBreadcrumbService,
    public user: UserInfoService
  ) {}

  public ngOnInit(): void {
    this.service.breadcrumbs
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => this.processBreadcrumbs(params as BreadcrumbItem[]));
  }

  private processBreadcrumbs(params: BreadcrumbItem[]): void {
    if (!params.length || !params[0]) {
      this.breadcrumbs = [];
      return;
    }

    // Work on a copy — never mutate the upstream observable emission
    let crumbs: BreadcrumbItem[] = params.map(p => ({
      ...p,
      label: this.user.selfBrandedOrgName
        ? this.getModuleNameByOrgName(p.label, this.user.selfBrandedOrgName)
        : p.label,
    }));

    // Remove the parent breadcrumb entry that precedes 'UPC for AI' / 'AI Agents'
    const aiIndex = crumbs.findIndex(p => p.label === 'UPC for AI' || p.label === 'AI Agents');
    if (aiIndex > 0) {
      crumbs = crumbs.filter((_, i) => i !== aiIndex - 1);
    }

    this.breadcrumbs = crumbs;
  }

  trackByUrl(_index: number, crumb: BreadcrumbItem): string {
    return crumb.url;
  }

  getModuleNameByOrgName(moduleName: string, orgName?: string): string {
    switch (moduleName) {
      case 'Unity View':
        return orgName ? 'Observability' : 'Unity View';

      // Unity Cloud
      case 'Unity Cloud':
        return orgName ? 'Cloud Management' : 'Unity Cloud';
      case 'Datacenter':
        return orgName ? 'DCIM' : 'Datacenter';
      case 'Unity Connect':
        return orgName ? 'UnitedConnect®' : 'Unity Connect';

      // Unity Services
      case 'Unity Services':
        return orgName ? 'Cloud Intelligence' : 'Unity Services';
      case 'Devops Automation':
        return orgName ? 'Agentic Orchestration' : 'Devops Automation';
      case 'AI Observability':
        return orgName ? 'AI Performance' : 'AI Observability';
      case 'LLM':
        return orgName ? 'LLM Performance' : 'LLM';
      case 'Vector DB':
        return orgName ? 'Vector DB Performance' : 'Vector DB';
      case 'GPU':
        return orgName ? 'GPU Performance' : 'GPU';

      // Cost Analysis
      case 'Cost Analysis':
        return orgName ? 'FINOPS' : 'Cost Analysis';

      // Unity Reports
      case 'Unity Reports':
        return orgName ? 'Reports' : 'Unity Reports';

      // Support
      case 'Support':
        return orgName ? 'ITSM' : 'Support';

      // Unity Setup
      case 'Unity Setup':
        return orgName ? `${orgName} Administration` : 'Unity Setup';
      case 'Credentials':
        return orgName ? 'Secrets Management' : 'Credentials';

      default:
        return moduleName;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
