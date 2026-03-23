import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JiraInstanceProject } from 'src/app/shared/SharedEntityTypes/jira.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { JiraTicketsService } from './jira-tickets.service';

@Component({
  selector: 'jira-tickets',
  templateUrl: './jira-tickets.component.html',
  styleUrls: ['./jira-tickets.component.scss'],
  providers: [JiraTicketsService]
})
export class JiraTicketsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  currentCriteria: SearchCriteria;
  instanceId: string;
  projectId: string;
  serviceDeskId: string;
  projects: JiraInstanceProject[] = [];
  constructor(private tktSvc: JiraTicketsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.instanceId = params.get('tmId'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.projectId = params.get('projectId');
    });
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{ 'project_id': this.projectId, 'serviceDeskId': null, }]
    };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getProjects();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getProjects() {
    this.tktSvc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.projects = res.project_details;
      this.loadProject();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      console.log('projects err : ', err);
    })
  }

  loadProject() {
    if (!this.projectId) {
      this.goTo(this.projects[0]);
    } else {
      this.currentCriteria.params[0].serviceDeskId = this.projects.find(p => p.project_id == this.projectId).serviceDeskId;
      this.serviceDeskId = this.currentCriteria.params[0].serviceDeskId;
    }
  }

  goTo(view: JiraInstanceProject) {
    this.projectId = null;
    this.serviceDeskId = null;
    setTimeout(() => {
      this.currentCriteria.params[0].project_id = view.project_id;
      this.currentCriteria.params[0].serviceDeskId = view.serviceDeskId;
      this.projectId = view.project_id;
      this.serviceDeskId = view.serviceDeskId;
      this.router.navigate(['jira-tickets', view.project_id], { relativeTo: this.route.parent });
    }, 0)
  }

  isActive(tab: JiraInstanceProject) {
    if (this.router.url.match('/support/ticketmgmt/' + this.instanceId + '/jira-tickets/' + tab.project_id)) {
      return 'active text-success';
    }
  }

}
