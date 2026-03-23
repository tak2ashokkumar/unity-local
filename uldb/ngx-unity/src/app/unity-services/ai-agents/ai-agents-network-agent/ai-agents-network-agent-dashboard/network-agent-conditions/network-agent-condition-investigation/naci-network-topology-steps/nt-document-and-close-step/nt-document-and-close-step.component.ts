import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NaciNetworkTopologyStepsService } from '../naci-network-topology-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nt-document-and-close-step',
  templateUrl: './nt-document-and-close-step.component.html',
  styleUrls: ['./nt-document-and-close-step.component.scss']
})
export class NtDocumentAndCloseStepComponent implements OnInit,OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: any;

  constructor(private cliSvc: NaciNetworkTopologyStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      this.documentAndCloseOpen = StepName == 'documentAndClose' ? !this.documentAndCloseOpen : false;
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.chatResponse?.answer?.stage != 'Stage 5') {
      return;
    }
    this.toggleDocumentAndClose();
    this.documentAndCloseViewData = this.chatResponse?.answer?.data;
  }

  toggleDocumentAndClose() {
    this.cliSvc.toggle('documentAndClose');
  }

}
