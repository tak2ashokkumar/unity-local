import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnitySupportJiraTicketMgmtService } from '../unity-support-jira-ticket-mgmt.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'unity-support-jira-ticket-mgmt-project',
  templateUrl: './unity-support-jira-ticket-mgmt-project.component.html',
  styleUrls: ['./unity-support-jira-ticket-mgmt-project.component.scss']
})
export class UnitySupportJiraTicketMgmtProjectComponent implements OnInit {
  instanceId: string;
  projectId: string;
  serviceDeskId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  constructor(private ticketSvc: UnitySupportJiraTicketMgmtService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.instanceId = params.get('tmId'));
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.projectId = params.get('projectId');
      this.updateCriteria();
    });
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{ 'instanceId': this.instanceId, 'project_id': this.projectId, 'serviceDeskId': null, }]
    };

  }

  ngOnInit(): void { }

  updateCriteria() {
    this.spinner.start('main');
    this.serviceDeskId = null;
    this.ticketSvc.getProjects(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      if (res.projects_selected.length) {
        let project = res.projects_selected.find(p => p.project_id == this.projectId);
        if (project) {
          let obj = { 'instanceId': this.instanceId, 'project_id': this.projectId, 'serviceDeskId': project.serviceDeskId }
          this.currentCriteria.params[0] = obj;
          this.serviceDeskId = project.serviceDeskId;
        }
      }
    }, err => {
      this.spinner.stop('main');
    })
  }

}
