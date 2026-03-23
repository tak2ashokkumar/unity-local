import { Component, OnInit } from '@angular/core';
import { MS_DYNAMICS_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'unity-support-feedback',
  templateUrl: './unity-support-feedback.component.html',
  styleUrls: ['./unity-support-feedback.component.scss']
})
export class UnitySupportFeedbackComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() {
  }

  ngOnInit() {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': MS_DYNAMICS_TICKET_TYPE.PROBLEM, 'unity_feedback': true }]
    };
  }
}
