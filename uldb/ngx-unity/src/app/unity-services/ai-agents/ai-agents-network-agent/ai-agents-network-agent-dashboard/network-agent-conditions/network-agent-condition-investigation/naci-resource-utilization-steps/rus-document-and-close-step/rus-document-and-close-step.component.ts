import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NaciResourceUtilizationStepsService } from '../naci-resource-utilization-steps.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'rus-document-and-close-step',
  templateUrl: './rus-document-and-close-step.component.html',
  styleUrls: ['./rus-document-and-close-step.component.scss'],
})
export class RusDocumentAndCloseStepComponent implements OnInit, OnChanges {
  private ngUnsubscribe = new Subject();

  @Input('chatResponse') chatResponse: any;

  documentAndCloseOpen: boolean = false;
  documentAndCloseViewData: any;

  constructor(private cliSvc: NaciResourceUtilizationStepsService) {
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
