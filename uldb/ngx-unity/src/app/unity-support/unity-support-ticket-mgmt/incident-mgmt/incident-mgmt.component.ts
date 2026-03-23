import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'incident-mgmt',
  templateUrl: './incident-mgmt.component.html',
  styleUrls: ['./incident-mgmt.component.scss']
})
export class IncidentMgmtComponent implements OnInit {

  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() {
  }

  ngOnInit() {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': TICKET_TYPE.INCIDENT }]
    };
  }


}
