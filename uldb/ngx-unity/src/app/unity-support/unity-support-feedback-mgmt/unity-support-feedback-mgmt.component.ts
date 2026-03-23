import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'unity-support-feedback-mgmt',
  templateUrl: './unity-support-feedback-mgmt.component.html',
  styleUrls: ['./unity-support-feedback-mgmt.component.scss']
})
export class UnitySupportFeedbackMgmtComponent implements OnInit {
  tabItems: TabData[] = tabData;

  constructor() { }

  ngOnInit(): void {
  }

}
const tabData: TabData[] = [
  {
    name: 'Feedback',
    url: '/support/feedback'
  }
];