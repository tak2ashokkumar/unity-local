import { Component, forwardRef, Input } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'event-analytics-ticket-route-context',
  template: '<ng-content></ng-content>',
  providers: [
    { provide: ActivatedRoute, useExisting: forwardRef(() => EventAnalyticsTicketRouteContextComponent) }
  ]
})
export class EventAnalyticsTicketRouteContextComponent {
  private accountId: string;
  private projectId: string;

  readonly paramMap = new BehaviorSubject(convertToParamMap({}));
  readonly parent = {
    paramMap: new BehaviorSubject(convertToParamMap({})),
    parent: {
      paramMap: new BehaviorSubject(convertToParamMap({}))
    }
  };
  readonly snapshot = { data: {} };

  @Input()
  set ticketAccountId(value: string) {
    this.accountId = value;
    this.updateRouteParams();
  }

  @Input()
  set ticketProjectId(value: string) {
    this.projectId = value;
    this.updateRouteParams();
  }

  private updateRouteParams() {
    const accountParams = this.accountId ? { tmId: this.accountId } : {};
    const projectParams = this.projectId ? { projectId: this.projectId } : {};
    this.parent.paramMap.next(convertToParamMap(accountParams));
    this.parent.parent.paramMap.next(convertToParamMap(accountParams));
    this.paramMap.next(convertToParamMap(projectParams));
  }
}
