import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedJiraTcktMgmtComponent } from '../shared-jira-tckt-mgmt.component';
import { JiraTicketQueueType } from '../../SharedEntityTypes/jira.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'jira-dashboard-tckt-mgmt',
  templateUrl: './jira-dashboard-tckt-mgmt.component.html',
  styleUrls: ['./jira-dashboard-tckt-mgmt.component.scss']
})
export class JiraDashboardTcktMgmtComponent extends SharedJiraTcktMgmtComponent implements OnInit, OnChanges {
  queues: JiraTicketQueueType[] = [];

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.spinnerService.start(this.spinnerName);
    this.instanceId = this.currentCriteria.params[0]['instanceId'] ? this.currentCriteria.params[0]['instanceId'] : null;
    this.projectId = this.currentCriteria.params[0]['project_id'] ? this.currentCriteria.params[0]['project_id'] : null;
    this.getQueues();
  }

  getQueues() {
    this.queues = [];
    this.ticketService.getQueues(this.instanceId, this.projectId, this.currentCriteria.params[0]['serviceDeskId']).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.queues = res;
      this.updateParams();
      super.ngOnInit();
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.queues = [];
      this.spinnerService.stop(this.spinnerName);
    })
  }

  updateParams() {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.params[0]['queue_id'] = this.queues[0].queue_id;
  }

}
