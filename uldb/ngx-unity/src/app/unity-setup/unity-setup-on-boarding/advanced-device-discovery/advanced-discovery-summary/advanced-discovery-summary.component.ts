import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'advanced-discovery-summary',
  templateUrl: './advanced-discovery-summary.component.html',
  styleUrls: ['./advanced-discovery-summary.component.scss']
})
export class AdvancedDiscoverySummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewTypes = SummaryViewTypes;
  viewType: string = SummaryViewTypes.SUMMARY;
  constructor() { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  changeView(view: string) {
    this.viewType = view;
    console.log('this.viewType : ', this.viewType);
    console.log('viewTypes : ', this.viewTypes);
  }
}

export enum SummaryViewTypes {
  SUMMARY = 'list',
  NETWORK = 'network',
}
