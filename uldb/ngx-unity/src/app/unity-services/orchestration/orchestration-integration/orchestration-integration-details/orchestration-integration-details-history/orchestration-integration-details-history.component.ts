import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrchestrartionIntegrationDetailsHistoryService, PlaybookHistoryViewData } from './orchestrartion-integration-details-history.service';
import { OrchestrationIntegrationDetailsPlaybookService, PlaybooksViewData } from '../orchestration-integration-details-playbook/orchestration-integration-details-playbook.service';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'orchestration-integration-details-history',
  templateUrl: './orchestration-integration-details-history.component.html',
  styleUrls: ['./orchestration-integration-details-history.component.scss'],
  providers: [OrchestrartionIntegrationDetailsHistoryService, OrchestrationIntegrationDetailsPlaybookService]

})
export class OrchestrationIntegrationDetailsHistoryComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  viewData: PlaybookHistoryViewData[] = [];
  repoId: string;
  detailsForm: FormGroup;
  playbookViewModalRef: BsModalRef;
  @ViewChild('viewPlaybook') view: ElementRef;

  constructor(private playbookHistorySrv: OrchestrartionIntegrationDetailsHistoryService,
    private orchestrationIntegrationDetailsPlaybookService: OrchestrationIntegrationDetailsPlaybookService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.parent.paramMap.subscribe(params => this.repoId = params.get('repoId'));

  }

  ngOnInit(): void {
    this.getPlaybooksHistoryData();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }


  getPlaybooksHistoryData() {
    this.playbookHistorySrv.getPlaybooks(this.repoId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.playbookHistorySrv.convertToViewData(data);
    });
  }

  executeTask(view: PlaybookHistoryViewData) {
    this.router.navigate(['tasks', 'integration', this.repoId, 'history', view.taskFk, 'execute'], { relativeTo: this.route.parent.parent });
  }

  viewDetails(data: PlaybooksViewData) {
    this.buildDeatilsForm(data);
    this.playbookViewModalRef = this.modalService.show(this.view, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  buildDeatilsForm(data: PlaybooksViewData) {
    this.detailsForm = this.orchestrationIntegrationDetailsPlaybookService.buildDetailsForm(data);
  }

  refreshPage(isExecuted: boolean) {
    if (isExecuted) {
      this.getPlaybooksHistoryData();
    }
  }

}
