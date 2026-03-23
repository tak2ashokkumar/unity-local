import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NaciCentralizedLogsStepsService } from '../naci-centralized-logs-steps.service';
import { ClsDocumentAndCloseStepService } from './cls-document-and-close-step.service';

@Component({
  selector: 'cls-document-and-close-step',
  templateUrl: './cls-document-and-close-step.component.html',
  styleUrls: ['./cls-document-and-close-step.component.scss'],
  providers: [ClsDocumentAndCloseStepService]
})
export class ClsDocumentAndCloseStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: any;

  constructor(private clSvc: NaciCentralizedLogsStepsService) {
    this.clSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.documentAndCloseOpen = StepName == 'documentAndClose' ? !this.documentAndCloseOpen : false;
      }, 0);
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (this.chatResponse?.answer?.stage != 'Stage 5') {
      return;
    }
    this.toggleDocumentAndClose();
    this.documentAndCloseViewData = this.chatResponse?.answer?.data;
  }

  toggleDocumentAndClose() {
    this.clSvc.toggle('documentAndClose');
  }
}
