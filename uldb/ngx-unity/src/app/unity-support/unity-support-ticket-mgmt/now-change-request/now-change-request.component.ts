import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { SERVICE_NOW_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'now-change-request',
  templateUrl: './now-change-request.component.html',
  styleUrls: ['./now-change-request.component.scss']
})
export class NowChangeRequestComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() {
  }

  ngOnInit() {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST }]
    };
  }
}
