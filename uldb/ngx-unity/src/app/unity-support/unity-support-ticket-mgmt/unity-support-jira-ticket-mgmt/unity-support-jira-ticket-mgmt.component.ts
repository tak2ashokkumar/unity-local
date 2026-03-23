import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JiraInstanceProject } from 'src/app/shared/SharedEntityTypes/jira.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnitySupportJiraTicketMgmtService } from './unity-support-jira-ticket-mgmt.service';

@Component({
  selector: 'unity-support-jira-ticket-mgmt',
  templateUrl: './unity-support-jira-ticket-mgmt.component.html',
  styleUrls: ['./unity-support-jira-ticket-mgmt.component.scss']
})
export class UnitySupportJiraTicketMgmtComponent implements OnInit, OnDestroy {
  instanceId: string;
  projectId: string;
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  projects: JiraInstanceProject[] = [];
  serviceDeskId: string;
  constructor(private tktSvc: UnitySupportJiraTicketMgmtService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.instanceId = params.get('tmId'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.projectId = params.get('projectId');
    });
  }

  ngOnInit(): void {
    this.getProjects();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
  }

  getProjects() {
    this.spinner.start('main');
    this.tktSvc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.projects = res.project_details;
      this.loadProject();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  loadProject() {
    if (this.projectId) {
      let project = this.projects.find(p => p.project_id == this.projectId);
      if (project) {
        this.goTo(project);
      } else {
        this.goTo(this.projects[0]);
      }
    } else {
      let last = this.router.url.split('/').getLast();
      if (last != 'details') {
        let project = this.projects.find(p => p.project_id == last);
        if (project) {
          this.projectId = last;
          this.goTo(project);
        } else {
          this.goTo(this.projects[0]);
        }
      }
    }
  }

  goTo(view: JiraInstanceProject) {
    this.router.navigate(['projects/', view.project_id], { relativeTo: this.route });
  }

  isActive(view: JiraInstanceProject) {
    if (this.router.url.match('/support/ticketmgmt/' + this.instanceId + '/jira/projects/' + view.project_id)) {
      return 'active text-success';
    }
  }

}
