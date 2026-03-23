import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NaciCliCheckStepsService } from '../naci-cli-check-steps.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ccs-document-and-close-step',
  templateUrl: './ccs-document-and-close-step.component.html',
  styleUrls: ['./ccs-document-and-close-step.component.scss']
})
export class CcsDocumentAndCloseStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: any;

  constructor(private cliSvc: NaciCliCheckStepsService) {
    this.cliSvc.toggleAnnouncedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((StepName) => {
      setTimeout(() => {
        this.documentAndCloseOpen = StepName == 'documentAndClose' ? !this.documentAndCloseOpen : false;
      }, 0);
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
